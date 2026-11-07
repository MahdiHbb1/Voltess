import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AiConfig } from '../../ai-config';

/**
 * Gemini OCR Adapter for P1 (Meter), P2 (Label), P3 (Token).
 * 
 * Uses Gemini Vision API (3.5 Flash-Lite free tier) to extract text
 * and structured data from images.
 */
export class GeminiOcrAdapter {
  private readonly client: GoogleGenerativeAI;
  private readonly model: string = 'gemini-3.5-flash-lite';

  constructor(private readonly config: AiConfig) {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY diperlukan untuk GeminiOcrAdapter');
    }
    this.client = new GoogleGenerativeAI(config.geminiApiKey);
  }

  /**
   * P1: Extract kWh reading from electricity meter photo.
   * 
   * @param imageBuffer - Image file buffer (JPEG, PNG)
   * @param meterType - 'prabayar' or 'pascabayar'
   * @returns OCR result with kWh value and confidence
   */
  async ocrMeter(
    imageBuffer: Buffer,
    meterType: 'prabayar' | 'pascabayar',
    mimeType = 'image/jpeg'
  ): Promise<OcrMeterResult> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    });

    const prompt = `Ekstrak angka kWh dari foto meteran listrik ${meterType}.

Instruksi:
- Cari angka pada display utama meter (biasanya 4-7 digit)
- Untuk meter analog: baca jarum dari kiri ke kanan
- Untuk meter digital: baca angka persis seperti yang terlihat di layar LCD/LED
- JANGAN menggeser, menambah, atau menghilangkan titik desimal. Titik hanya
  ditulis jika benar-benar terlihat di display.
- Abaikan nomor pelanggan, barcode, nomor seri, tarif, dan tulisan lain
- Jika display tidak terbaca, isi "kwh": null dan "needs_retake": true
- Unit selalu kWh

Format respons JSON:
{
  "kwh": <angka desimal atau null>,
  "confidence": <0.0-1.0>,
  "digits_confidence": [<confidence per digit>],
  "needs_retake": <true jika foto tidak jelas>,
  "bbox": [x, y, width, height] (area angka kWh)
}

Contoh: { "kwh": 12345.6, "confidence": 0.95, "digits_confidence": [0.99, 0.97, 0.98, 0.95, 0.90, 0.88], "needs_retake": false, "bbox": [120, 240, 480, 360] }`;

    try {
      const imageParts = [
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType,
          },
        },
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini tidak mengembalikan JSON valid');
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        kwh: number | null;
        confidence: number;
        digits_confidence?: number[];
        needs_retake?: boolean;
        bbox?: [number, number, number, number];
      };

      if (typeof parsed.kwh !== 'number' || !Number.isFinite(parsed.kwh)) {
        throw new Error('Angka kWh tidak terbaca dari foto. Coba foto ulang dengan pencahayaan lebih baik.');
      }

      // Map confidence to C3 schema levels
      const confidenceLevel = this.mapConfidence(parsed.confidence);
      const needsRetake = parsed.needs_retake ?? confidenceLevel === 'low';

      return {
        kwh: parsed.kwh,
        unit: 'kWh',
        confidence: confidenceLevel,
        digits_confidence: parsed.digits_confidence ?? [parsed.confidence],
        needs_retake: needsRetake,
        ...(parsed.bbox ? { bbox: parsed.bbox } : {}),
        warnings: needsRetake ? ['foto_tidak_jelas'] : [],
      };
    } catch (error) {
      throw this.mapError(error, 'ocr-meter');
    }
  }

  /**
   * P2: Extract appliance name and power (W) from label photo.
   * 
   * @param imageBuffer - Image file buffer
   * @param applianceHint - Optional hint (e.g., 'AC', 'kulkas')
   * @returns OCR result with name and power
   */
  async ocrLabel(
    imageBuffer: Buffer,
    applianceHint?: string,
    mimeType = 'image/jpeg'
  ): Promise<OcrLabelResult> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    });

    const hintText = applianceHint ? `\nHint: alat ini mungkin ${applianceHint}` : '';
    const prompt = `Ekstrak informasi dari label alat elektronik.${hintText}

Instruksi:
- Cari nama alat (AC, kulkas, mesin cuci, dll)
- Cari daya dalam Watt (W) atau kiloWatt (kW)
- Jika ada voltase (V) dan arus (A), hitung: W = V × A
- Konversi kW ke W (1 kW = 1000 W)

Format respons JSON:
{
  "name": "<nama alat>",
  "power_w": <daya dalam Watt>,
  "confidence": <0.0-1.0>
}

Contoh: { "name": "AC Split 1 PK", "power_w": 900, "confidence": 0.92 }`;

    try {
      const imageParts = [
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType,
          },
        },
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini tidak mengembalikan JSON valid');
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        name: string;
        power_w: number;
        confidence: number;
      };

      const confidenceLevel = this.mapConfidence(parsed.confidence);

      return {
        name: parsed.name,
        power_w: parsed.power_w,
        confidence: confidenceLevel,
        needs_retake: parsed.confidence < 0.7,
        warnings: parsed.confidence < 0.7 ? ['label_tidak_jelas'] : [],
      };
    } catch (error) {
      throw this.mapError(error, 'ocr-label');
    }
  }

  /**
   * P3: Extract PLN token data from screenshot.
   * 
   * @param imageBuffer - Image file buffer (screenshot or receipt)
   * @returns OCR result with token data
   */
  async ocrToken(imageBuffer: Buffer, mimeType = 'image/jpeg'): Promise<OcrTokenResult> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    });

    const prompt = `Ekstrak data token listrik PLN dari foto struk/layar.

Instruksi:
- Cari tanggal pembelian
- Cari jumlah pembayaran (Rupiah)
- Cari kWh yang dibeli
- Cari sisa kWh (jika ada)

Format respons JSON:
{
  "date": "YYYY-MM-DD",
  "amount_rp": <nominal Rupiah>,
  "kwh": <kWh yang dibeli>,
  "remaining_kwh": <sisa kWh (null jika tidak ada)>,
  "confidence": <0.0-1.0>
}

Contoh: { "date": "2026-11-06", "amount_rp": 100000, "kwh": 50.5, "remaining_kwh": 75.2, "confidence": 0.88 }`;

    try {
      const imageParts = [
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType,
          },
        },
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini tidak mengembalikan JSON valid');
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        date: string;
        amount_rp: number;
        kwh: number;
        remaining_kwh: number | null;
        confidence: number;
      };

      const confidenceLevel = this.mapConfidence(parsed.confidence);

      return {
        date: parsed.date,
        amount_rp: parsed.amount_rp,
        kwh: parsed.kwh,
        remaining_kwh: parsed.remaining_kwh,
        confidence: confidenceLevel,
        needs_retake: parsed.confidence < 0.7,
        warnings: parsed.confidence < 0.7 ? ['struk_tidak_jelas'] : [],
      };
    } catch (error) {
      throw this.mapError(error, 'ocr-token');
    }
  }

  /**
   * Map numeric confidence (0-1) to C3 schema levels.
   */
  private mapConfidence(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.85) return 'high';
    if (score >= 0.65) return 'medium';
    return 'low';
  }

  /**
   * Map Gemini errors to user-friendly messages.
   */
  private mapError(error: unknown, pipeline: string): Error {
    const message = error instanceof Error ? error.message : String(error);

    // API quota exceeded
    if (message.includes('quota') || message.includes('429')) {
      return new Error(
        'Kuota Gemini API habis hari ini. Coba lagi besok atau masukkan data manual ya.'
      );
    }

    // Invalid API key
    if (message.includes('API key') || message.includes('401')) {
      return new Error('API key Gemini tidak valid. Hubungi admin.');
    }

    // Network/timeout
    if (message.includes('network') || message.includes('timeout')) {
      return new Error('Koneksi ke Gemini terputus. Coba lagi dalam beberapa saat.');
    }

    // Generic error
    return new Error(
      `Gagal memproses foto (${pipeline}). Coba foto ulang dengan pencahayaan lebih baik.`
    );
  }
}

// Types for return values

export interface OcrMeterResult {
  kwh: number;
  unit: 'kWh';
  confidence: 'high' | 'medium' | 'low';
  digits_confidence: number[];
  needs_retake: boolean;
  bbox?: [number, number, number, number];
  warnings: string[];
}

export interface OcrLabelResult {
  name: string;
  power_w: number;
  confidence: 'high' | 'medium' | 'low';
  needs_retake: boolean;
  warnings: string[];
}

export interface OcrTokenResult {
  date: string;
  amount_rp: number;
  kwh: number;
  remaining_kwh: number | null;
  confidence: 'high' | 'medium' | 'low';
  needs_retake: boolean;
  warnings: string[];
}

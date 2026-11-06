import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiOcrAdapter } from './gemini-ocr.adapter';
import type { AiConfig } from '../../ai-config';

// Mock GoogleGenerativeAI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    constructor(_apiKey: string) {}
    getGenerativeModel = mockGetGenerativeModel;
  },
}));

describe('GeminiOcrAdapter', () => {
  let adapter: GeminiOcrAdapter;
  let mockConfig: AiConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockConfig = {
      mode: 'live',
      defaultScenario: 'success',
      allowScenarioOverride: false,
      geminiApiKey: 'test-gemini-key',
      assemblyaiApiKey: 'test-assemblyai-key',
    };

    adapter = new GeminiOcrAdapter(mockConfig);
  });

  describe('constructor', () => {
    it('throws error without API key', () => {
      const invalidConfig = { ...mockConfig, geminiApiKey: undefined };
      expect(() => new GeminiOcrAdapter(invalidConfig)).toThrow(/GEMINI_API_KEY/);
    });

    it('creates adapter with valid config', () => {
      expect(adapter).toBeInstanceOf(GeminiOcrAdapter);
    });
  });

  describe('ocrMeter (P1)', () => {
    it('extracts kWh from meter photo', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            kwh: 12345.6,
            confidence: 0.95,
            digits_confidence: [0.99, 0.97, 0.98, 0.95, 0.90, 0.88],
            needs_retake: false,
            bbox: [120, 240, 480, 360],
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('fake-image-data');
      const result = await adapter.ocrMeter(buffer, 'prabayar');

      expect(result.kwh).toBe(12345.6);
      expect(result.unit).toBe('kWh');
      expect(result.confidence).toBe('high');
      expect(result.needs_retake).toBe(false);
      expect(result.warnings).toEqual([]);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining('meteran listrik prabayar'),
          expect.objectContaining({
            inlineData: expect.objectContaining({
              mimeType: 'image/jpeg',
            }),
          }),
        ])
      );
    });

    it('returns low confidence when photo unclear', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            kwh: 12345.0,
            confidence: 0.55,
            digits_confidence: [0.6, 0.5, 0.6, 0.5, 0.6],
            needs_retake: true,
            bbox: [0, 0, 0, 0],
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('blurry-image');
      const result = await adapter.ocrMeter(buffer, 'pascabayar');

      expect(result.confidence).toBe('low');
      expect(result.needs_retake).toBe(true);
      expect(result.warnings).toContain('foto_tidak_jelas');
    });

    it('handles API quota exceeded error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('quota exceeded'));

      const buffer = Buffer.from('test');
      await expect(adapter.ocrMeter(buffer, 'prabayar')).rejects.toThrow(
        /Kuota Gemini API habis/
      );
    });

    it('handles invalid JSON response', async () => {
      const mockResponse = {
        response: {
          text: () => 'Not a JSON response',
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('test');
      await expect(adapter.ocrMeter(buffer, 'prabayar')).rejects.toThrow();
    });
  });

  describe('ocrLabel (P2)', () => {
    it('extracts appliance name and power', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            name: 'AC Split 1 PK',
            power_w: 900,
            confidence: 0.92,
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('label-image');
      const result = await adapter.ocrLabel(buffer);

      expect(result.name).toBe('AC Split 1 PK');
      expect(result.power_w).toBe(900);
      expect(result.confidence).toBe('high');
      expect(result.warnings).toEqual([]);
    });

    it('uses appliance hint in prompt', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            name: 'Kulkas 2 Pintu',
            power_w: 150,
            confidence: 0.88,
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('test');
      await adapter.ocrLabel(buffer, 'kulkas');

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining('mungkin kulkas'),
        ])
      );
    });

    it('warns on low confidence label', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            name: 'Alat tidak jelas',
            power_w: 100,
            confidence: 0.6,
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('damaged-label');
      const result = await adapter.ocrLabel(buffer);

      expect(result.confidence).toBe('low');
      expect(result.warnings).toContain('label_tidak_jelas');
    });
  });

  describe('ocrToken (P3)', () => {
    it('extracts token data from screenshot', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            date: '2026-11-06',
            amount_rp: 100000,
            kwh: 50.5,
            remaining_kwh: 75.2,
            confidence: 0.88,
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('token-screenshot');
      const result = await adapter.ocrToken(buffer);

      expect(result.date).toBe('2026-11-06');
      expect(result.amount_rp).toBe(100000);
      expect(result.kwh).toBe(50.5);
      expect(result.remaining_kwh).toBe(75.2);
      expect(result.confidence).toBe('high');
    });

    it('handles missing remaining_kwh', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            date: '2026-11-06',
            amount_rp: 50000,
            kwh: 25.0,
            remaining_kwh: null,
            confidence: 0.90,
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('receipt-only');
      const result = await adapter.ocrToken(buffer);

      expect(result.remaining_kwh).toBeNull();
      expect(result.confidence).toBe('high');
    });

    it('warns on unclear receipt', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            date: '2026-11-06',
            amount_rp: 50000,
            kwh: 25.0,
            remaining_kwh: null,
            confidence: 0.65,
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const buffer = Buffer.from('blurry-receipt');
      const result = await adapter.ocrToken(buffer);

      expect(result.confidence).toBe('medium');
      expect(result.warnings).toContain('struk_tidak_jelas');
    });
  });

  describe('error handling', () => {
    it('maps API key error to user-friendly message', async () => {
      mockGenerateContent.mockRejectedValue(new Error('401 API key invalid'));

      const buffer = Buffer.from('test');
      await expect(adapter.ocrMeter(buffer, 'prabayar')).rejects.toThrow(
        /API key Gemini tidak valid/
      );
    });

    it('maps network error to user-friendly message', async () => {
      mockGenerateContent.mockRejectedValue(new Error('network timeout'));

      const buffer = Buffer.from('test');
      await expect(adapter.ocrMeter(buffer, 'prabayar')).rejects.toThrow(
        /Koneksi ke Gemini terputus/
      );
    });

    it('provides generic error for unknown issues', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Unknown error'));

      const buffer = Buffer.from('test');
      await expect(adapter.ocrMeter(buffer, 'prabayar')).rejects.toThrow(
        /Gagal memproses foto/
      );
    });
  });

  describe('confidence mapping', () => {
    it('maps high confidence (≥0.85)', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            kwh: 100,
            confidence: 0.90,
            digits_confidence: [0.9, 0.9, 0.9],
            needs_retake: false,
            bbox: [0, 0, 0, 0],
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await adapter.ocrMeter(Buffer.from('test'), 'prabayar');
      expect(result.confidence).toBe('high');
    });

    it('maps medium confidence (0.65-0.84)', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            kwh: 100,
            confidence: 0.75,
            digits_confidence: [],
            needs_retake: false,
            bbox: [0, 0, 0, 0],
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await adapter.ocrMeter(Buffer.from('test'), 'prabayar');
      expect(result.confidence).toBe('medium');
    });

    it('maps low confidence (<0.65)', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            kwh: 100,
            confidence: 0.50,
            digits_confidence: [],
            needs_retake: true,
            bbox: [0, 0, 0, 0],
          }),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await adapter.ocrMeter(Buffer.from('test'), 'prabayar');
      expect(result.confidence).toBe('low');
    });
  });
});

import type { AiConfig } from '../../ai-config';
import type { SttExtractRequest, SttExtractResponse, SttEntry } from '@voltess/contracts';
import { AssemblyAI } from 'assemblyai';

/**
 * AssemblyAI STT Adapter for P4 (voice note transcription + appliance extraction).
 *
 * Uploads audio to AssemblyAI, transcribes with Indonesian language model,
 * then extracts appliance mentions and duration estimates using keyword matching.
 */
export class AssemblyAiSttAdapter {
  private readonly client: AssemblyAI;

  constructor(private readonly config: AiConfig) {
    if (!config.assemblyaiApiKey) {
      throw new Error('ASSEMBLYAI_API_KEY diperlukan untuk AssemblyAiSttAdapter');
    }
    this.client = new AssemblyAI({ apiKey: config.assemblyaiApiKey });
  }

  /**
   * P4: Transcribe voice note and extract appliance usage entries.
   *
   * @param audioBuffer - Audio file buffer (mp3, wav, m4a)
   * @param request - Appliance list and language hint
   * @returns Transcript + extracted entries
   */
  async sttExtract(
    audioBuffer: Buffer,
    request: SttExtractRequest,
  ): Promise<Omit<SttExtractResponse, 'request_id' | 'engine_version' | 'mode' | 'confidence' | 'warnings'>> {
    const language = request.language ?? 'id';

    try {
      // Upload audio
      const uploadUrl = await this.client.files.upload(audioBuffer);

      // Transcribe with language detection
      const transcript = await this.client.transcripts.transcribe({
        audio: uploadUrl,
        language_code: (language === 'id' || language === 'en' ? language : 'id') as 'id' | 'en',
        punctuate: true,
        format_text: true,
      });

      if (transcript.status === 'error') {
        throw new Error(transcript.error ?? 'Transcription failed');
      }

      const text = transcript.text ?? '';
      const entries = this.extractEntries(text, request.appliances);

      return {
        transcript: text,
        entries,
        work_volume: null,
        confirm_text:
          entries.length > 0
            ? 'Periksa kembali jam alat sebelum menyimpan.'
            : 'Tidak ada alat yang disebutkan. Coba rekam ulang atau tambahkan manual.',
        unmatched_terms: [],
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  /**
   * Extract appliance mentions and duration from transcript.
   * Simple keyword matching; production would use NER or fine-tuned model.
   */
  private extractEntries(
    text: string,
    appliances: Array<{ id: string; name: string }>,
  ): SttEntry[] {
    const lower = text.toLowerCase();
    const entries: SttEntry[] = [];

    for (const appliance of appliances) {
      const namePattern = new RegExp(appliance.name.toLowerCase(), 'i');
      if (!namePattern.test(lower)) continue;

      // Extract hours: "8 jam", "delapan jam", "lima jam"
      const hourMatch = lower.match(
        /(\d+|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh)\s*(jam|hour)/i,
      );
      const hours = hourMatch?.[1] ? this.parseNumber(hourMatch[1]) : 1;

      entries.push({
        appliance_id: appliance.id,
        hours,
        conf: 0.75, // Keyword match confidence; real implementation would use NER confidence
      });
    }

    return entries;
  }

  private parseNumber(word: string): number {
    const map: Record<string, number> = {
      satu: 1,
      dua: 2,
      tiga: 3,
      empat: 4,
      lima: 5,
      enam: 6,
      tujuh: 7,
      delapan: 8,
      sembilan: 9,
      sepuluh: 10,
    };
    return map[word.toLowerCase()] ?? (parseInt(word, 10) || 1);
  }

  private mapError(error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('quota') || message.includes('429')) {
      return new Error(
        'Kuota AssemblyAI habis hari ini. Coba lagi besok atau masukkan data manual.',
      );
    }

    if (message.includes('API key') || message.includes('401')) {
      return new Error('API key AssemblyAI tidak valid. Hubungi admin.');
    }

    if (message.includes('audio_too_short')) {
      return new Error('Audio terlalu pendek. Rekam ulang dengan durasi minimal 0.5 detik.');
    }

    return new Error(
      'Gagal memproses voice note. Coba rekam ulang dengan suara lebih jelas atau background lebih tenang.',
    );
  }
}

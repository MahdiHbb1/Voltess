import { Injectable, Inject } from '@nestjs/common';
import type { AiConfig } from '../ai-config';
import { AI_CONFIG } from '../ai-config';
import { MockAiService } from '../mock-ai.service';
import { GeminiOcrAdapter } from './live/gemini-ocr.adapter';

/**
 * Adapter factory for AI Gateway.
 * 
 * Selects appropriate adapter based on AI_MODE:
 * - mock: Returns MockAiService
 * - live: Returns live adapters (Gemini, AssemblyAI)
 * - hybrid: Mix of mock and live (not implemented yet)
 */
@Injectable()
export class AdapterFactory {
  private geminiOcrAdapter?: GeminiOcrAdapter;

  constructor(
    @Inject(AI_CONFIG) private readonly config: AiConfig,
    private readonly mockAi: MockAiService,
  ) {
    // Initialize live adapters if in live mode
    if (this.config.mode === 'live') {
      this.geminiOcrAdapter = new GeminiOcrAdapter(this.config);
    }
  }

  /**
   * Get OCR adapter (P1, P2, P3) based on mode.
   */
  getOcrAdapter(): GeminiOcrAdapter | MockAiService {
    if (this.config.mode === 'live') {
      if (!this.geminiOcrAdapter) {
        throw new Error('Gemini OCR adapter tidak tersedia. Periksa konfigurasi.');
      }
      return this.geminiOcrAdapter;
    }

    // Default to mock
    return this.mockAi;
  }

  /**
   * Check if current mode is live.
   */
  isLiveMode(): boolean {
    return this.config.mode === 'live';
  }

  /**
   * Check if current mode is mock.
   */
  isMockMode(): boolean {
    return this.config.mode === 'mock';
  }
}

import { Injectable, Inject } from '@nestjs/common';
import type { AiConfig } from '../ai-config';
import { AI_CONFIG } from '../ai-config';
import { GeminiOcrAdapter } from './live/gemini-ocr.adapter';
import { AssemblyAiSttAdapter } from './live/assemblyai-stt.adapter';
import { GroqLlmAdapter } from './live/groq-llm.adapter';

/**
 * Adapter factory for AI Gateway.
 *
 * Selects the live OCR/STT/LLM adapters when AI_MODE is hybrid/live and keys
 * are configured. Non-OCR pipelines fall back to MockAiService in hybrid mode.
 */
@Injectable()
export class AdapterFactory {
  private readonly geminiOcrAdapter?: GeminiOcrAdapter;
  private readonly assemblyAiSttAdapter?: AssemblyAiSttAdapter;
  private readonly groqLlmAdapter?: GroqLlmAdapter;

  constructor(@Inject(AI_CONFIG) private readonly config: AiConfig) {
    // Live OCR is available in hybrid and live modes. In mock mode the
    // gateway always returns deterministic mock responses.
    if (this.config.mode !== 'mock' && this.config.geminiApiKey) {
      this.geminiOcrAdapter = new GeminiOcrAdapter(this.config);
    }

    // Live STT and LLM are available in live mode only; hybrid keeps them on mock.
    if (this.config.mode === 'live') {
      if (this.config.assemblyaiApiKey) {
        this.assemblyAiSttAdapter = new AssemblyAiSttAdapter(this.config);
      }
      if (this.config.groqApiKey) {
        this.groqLlmAdapter = new GroqLlmAdapter(this.config);
      }
    }
  }

  /**
   * Returns the live OCR adapter, or undefined when OCR runs in mock mode.
   */
  getLiveOcrAdapter(): GeminiOcrAdapter | undefined {
    return this.geminiOcrAdapter;
  }

  getLiveSttAdapter(): AssemblyAiSttAdapter | undefined {
    return this.assemblyAiSttAdapter;
  }

  getLiveLlmAdapter(): GroqLlmAdapter | undefined {
    return this.groqLlmAdapter;
  }

  hasLiveOcr(): boolean {
    return this.geminiOcrAdapter !== undefined;
  }

  hasLiveStt(): boolean {
    return this.assemblyAiSttAdapter !== undefined;
  }

  hasLiveLlm(): boolean {
    return this.groqLlmAdapter !== undefined;
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

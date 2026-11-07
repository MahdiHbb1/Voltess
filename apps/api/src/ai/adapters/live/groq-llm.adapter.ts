import type { AiConfig } from '../../ai-config';
import type {
  RecommendRequest,
  RecommendResponse,
  ExplainRequest,
  ExplainResponse,
  AskRequest,
  AskResponse,
} from '@voltess/contracts';

/**
 * Groq LLM Adapter for P5 (explain), P7 (recommend), and P8 (ask).
 *
 * Uses Groq's `openai/gpt-oss-20b` model for Indonesian language reasoning.
 */
export class GroqLlmAdapter {
  private readonly apiKey: string;
  private readonly model = 'openai/gpt-oss-20b';
  private readonly baseUrl = 'https://api.groq.com/openai/v1';

  constructor(private readonly config: AiConfig) {
    if (!config.groqApiKey) {
      throw new Error('GROQ_API_KEY diperlukan untuk GroqLlmAdapter');
    }
    this.apiKey = config.groqApiKey;
  }

  /**
   * P5: Explain a result (estimate/recommendation/report) in natural language.
   */
  async explain(
    request: ExplainRequest,
  ): Promise<Omit<ExplainResponse, 'request_id' | 'engine_version' | 'mode' | 'confidence' | 'warnings'>> {
    const lang = request.language || 'id';
    const prompt = lang === 'id'
      ? `Jelaskan hasil ${request.kind} ini dalam 2-3 kalimat bahasa Indonesia yang mudah dipahami pemilik warung:

${JSON.stringify(request.result, null, 2)}

Fokus pada insight praktis dan angka kunci.`
      : `Explain this ${request.kind} result in 2-3 sentences that a small business owner can understand:

${JSON.stringify(request.result, null, 2)}

Focus on practical insights and key numbers.`;

    try {
      const response = await this.chat(prompt, 0.3, 500);
      return {
        text: response,
        numbers_used: [],
        fallback_used: false,
      };
    } catch (error) {
      throw this.mapError(error, 'explain');
    }
  }

  /**
   * P7: Generate energy-saving recommendations from an estimate.
   */
  async recommend(
    request: RecommendRequest,
  ): Promise<Omit<RecommendResponse, 'request_id' | 'engine_version' | 'mode' | 'confidence' | 'warnings'>> {
    const estimate = request.estimate as any;
    const lang = request.language || 'id';
    const prompt = lang === 'id'
      ? `Berikan 2 saran penghematan listrik untuk warung berdasarkan estimasi ini:

${JSON.stringify(estimate, null, 2)}

Template: ${request.template_id}
Unit: ${request.unit_label}

Format: tindakan konkret + estimasi hemat kWh. Bahasa Indonesia sederhana.`
      : `Provide 2 energy-saving recommendations for a small business based on this estimate:

${JSON.stringify(estimate, null, 2)}

Template: ${request.template_id}
Unit: ${request.unit_label}

Format: concrete action + estimated kWh savings. Simple language.`;

    try {
      const response = await this.chat(prompt, 0.4, 500);
      
      // Parse LLM output into structured recommendations (simplified)
      return {
        recommendations: [
          {
            action_id: 'reduce_peak_hours',
            title: response.split('\n')[0] || (lang === 'id' ? 'Kurangi jam pemakaian alat besar' : 'Reduce peak hours for high-power appliances'),
            est_saving_kwh: { min: 5, max: 15 },
            est_saving_rp: { min: 7500, max: 22500 },
            confidence: 'medium',
            effort: 'medium',
            score: 0.5,
          },
        ],
      };
    } catch (error) {
      throw this.mapError(error, 'recommend');
    }
  }

  /**
   * P8: Answer free-form questions about energy usage.
   */
  async ask(
    request: AskRequest,
  ): Promise<Omit<AskResponse, 'request_id' | 'engine_version' | 'mode' | 'confidence' | 'warnings'>> {
    const lang = request.language || 'id';
    const prompt = lang === 'id'
      ? `Kamu asisten listrik untuk warung. Jawab pertanyaan ini dalam 2-3 kalimat bahasa Indonesia yang praktis:

Pertanyaan: ${request.question}

Business ID: ${request.business_id}
${request.conversation_id ? `Conversation ID: ${request.conversation_id}` : ''}`
      : `You are an electricity assistant for small businesses. Answer this question in 2-3 practical sentences:

Question: ${request.question}

Business ID: ${request.business_id}
${request.conversation_id ? `Conversation ID: ${request.conversation_id}` : ''}`;

    try {
      const response = await this.chat(prompt, 0.3, 500);
      return {
        answer: response,
        sources: [],
        disclaimer: lang === 'id'
          ? 'Jawaban berdasarkan data yang tersedia. Keputusan akhir tetap milik pemilik usaha.'
          : 'Answer based on available data. Final decision remains with the business owner.',
        followup_mission: null,
      };
    } catch (error) {
      throw this.mapError(error, 'ask');
    }
  }

  /**
   * Call Groq chat API.
   */
  private async chat(prompt: string, temperature: number, maxTokens: number): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        temperature,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq API error ${response.status}: ${text}`);
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = body.choices?.[0]?.message?.content;
    if (content === undefined) {
      throw new Error('Groq tidak mengembalikan respons yang valid');
    }

    return content.trim();
  }

  private mapError(error: unknown, pipeline: string): Error {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('quota') || message.includes('429')) {
      return new Error('Kuota Groq API habis. Coba lagi besok atau masukkan data manual.');
    }

    if (message.includes('API key') || message.includes('401')) {
      return new Error('API key Groq tidak valid. Hubungi admin.');
    }

    return new Error(
      `Gagal memproses permintaan (${pipeline}). Coba lagi atau hubungi dukungan.`,
    );
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface PipelineUsage {
  pipeline: string;
  date: string; // YYYY-MM-DD
  requests: number;
  tokens?: number;
  characters?: number;
  durationMs?: number;
}

export interface UsageSummary {
  pipeline: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  resetTime: string; // ISO timestamp
  isAlerting: boolean;
}

export interface DailyUsageRecord {
  id: string;
  pipeline: string;
  date: string;
  requests: number;
  tokens?: number;
  characters?: number;
  durationMs?: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UsageTrackerService implements OnModuleInit {
  private readonly logger = new Logger(UsageTrackerService.name);
  private supabase: SupabaseClient | undefined;
  private readonly dailyLimits: Record<string, number> = {
    'gemini-ocr': 500,
    'gemini-llm': 500,
    'assemblyai-stt': 185,
    'groq-llm': 500,
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn(
        'Supabase not configured - usage tracking will be disabled',
      );
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Usage tracker initialized with Supabase');
    await this.ensureTableExists();
  }

  private async ensureTableExists() {
    // The table should be created via migration
    // This is a no-op if table exists
    if (!this.supabase) return;
    const { error } = await this.supabase.from('usage_tracking').select('id').limit(1);
    if (error && error.code === '42P01') {
      this.logger.warn(
        'usage_tracking table does not exist - please run migration',
      );
    }
  }

  /**
   * Record usage for a pipeline
   */
  async recordUsage(usage: PipelineUsage): Promise<void> {
    if (!this.supabase) {
      this.logger.debug('Supabase not configured, skipping usage record');
      return;
    }

    const today = usage.date || new Date().toISOString().split('T')[0];

    const { error } = await this.supabase
      .from('usage_tracking')
      .upsert(
        {
          pipeline: usage.pipeline,
          date: today,
          requests: usage.requests,
          tokens: usage.tokens,
          characters: usage.characters,
          duration_ms: usage.durationMs,
        },
        {
          onConflict: 'pipeline,date',
          ignoreDuplicates: false,
        },
      )
      .select();

    if (error) {
      this.logger.error(`Failed to record usage for ${usage.pipeline}:`, error);
      throw new Error(`Usage tracking failed: ${error.message}`);
    }

    this.logger.debug(
      `Recorded usage: ${usage.pipeline} - ${usage.requests} requests on ${today}`,
    );
  }

  /**
   * Get current usage for a pipeline (today)
   */
  async getCurrentUsage(pipeline: string): Promise<number> {
    if (!this.supabase) {
      return 0;
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('usage_tracking')
      .select('requests')
      .eq('pipeline', pipeline)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.logger.error(`Failed to get usage for ${pipeline}:`, error);
      throw new Error(`Usage query failed: ${error.message}`);
    }

    return data?.requests || 0;
  }

  /**
   * Get usage summary for all pipelines
   */
  async getAllUsageSummaries(): Promise<UsageSummary[]> {
    const summaries: UsageSummary[] = [];

    for (const [pipeline, limit] of Object.entries(this.dailyLimits)) {
      const currentUsage = await this.getCurrentUsage(pipeline);
      const percentage = limit > 0 ? (currentUsage / limit) * 100 : 0;
      const isAlerting = percentage >= 85;

      // Calculate reset time (midnight UTC)
      const now = new Date();
      const resetTime = new Date(now);
      resetTime.setUTCHours(24, 0, 0, 0);

      summaries.push({
        pipeline,
        currentUsage,
        limit,
        percentage: Math.round(percentage * 100) / 100,
        resetTime: resetTime.toISOString(),
        isAlerting,
      });
    }

    return summaries;
  }

  /**
   * Get usage history for a pipeline (last N days)
   */
  async getUsageHistory(pipeline: string, days: number = 30): Promise<DailyUsageRecord[]> {
    if (!this.supabase) {
      return [];
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('usage_tracking')
      .select('*')
      .eq('pipeline', pipeline)
      .gte('date', startDateStr)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      this.logger.error(`Failed to get history for ${pipeline}:`, error);
      throw new Error(`History query failed: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get usage history for all pipelines
   */
  async getAllUsageHistory(days: number = 30): Promise<Record<string, DailyUsageRecord[]>> {
    const result: Record<string, DailyUsageRecord[]> = {};

    for (const pipeline of Object.keys(this.dailyLimits)) {
      result[pipeline] = await this.getUsageHistory(pipeline, days);
    }

    return result;
  }

  /**
   * Check if a pipeline is at or above alert threshold (85%)
   */
  async isAlerting(pipeline: string): Promise<boolean> {
    const currentUsage = await this.getCurrentUsage(pipeline);
    const limit = this.dailyLimits[pipeline] || 0;
    return limit > 0 && (currentUsage / limit) * 100 >= 85;
  }

  /**
   * Get the daily limit for a pipeline
   */
  getDailyLimit(pipeline: string): number {
    return this.dailyLimits[pipeline] || 0;
  }

  /**
   * Record OCR usage (Gemini)
   */
  private getToday(): string {
    const dateStr = new Date().toISOString().split('T')[0];
    return dateStr as string;
  }

  /**
   * Record OCR usage (Gemini)
   */
  async recordOcrUsage(
    pipeline: 'gemini-ocr' | 'gemini-llm',
    requests: number = 1,
    tokens?: number,
  ): Promise<void> {
    await this.recordUsage({
      pipeline,
      date: this.getToday(),
      requests,
      tokens,
    });
  }

  /**
   * Record STT usage (AssemblyAI)
   */
  async recordSttUsage(
    requests: number = 1,
    characters?: number,
    durationMs?: number,
  ): Promise<void> {
    await this.recordUsage({
      pipeline: 'assemblyai-stt',
      date: this.getToday(),
      requests,
      characters,
      durationMs,
    });
  }

  /**
   * Record LLM usage (Groq)
   */
  async recordLlmUsage(
    pipeline: 'groq-llm',
    requests: number = 1,
    tokens?: number,
  ): Promise<void> {
    await this.recordUsage({
      pipeline,
      date: this.getToday(),
      requests,
      tokens,
    });
  }
}
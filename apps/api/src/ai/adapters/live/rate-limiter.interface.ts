/**
 * Rate limiter interface for AI Gateway.
 * 
 * Tracks API usage per pipeline per user per day to prevent exceeding
 * free tier limits (Gemini 500 RPD, AssemblyAI 185 hours).
 */

export type RateLimitPriority = 'high' | 'medium' | 'low';

export interface RateLimitResult {
  /** Whether the request is allowed within quota */
  allowed: boolean;
  
  /** Remaining calls in the current quota period */
  remaining: number;
  
  /** When the quota resets (midnight Pacific Time) */
  resetAt: Date;
  
  /** User-friendly message in Bahasa Indonesia (when quota exceeded) */
  userMessage?: string;
}

export interface RateLimiterService {
  /**
   * Check if a request is within quota limits.
   * 
   * @param pipeline - Pipeline identifier (e.g., 'ocr-meter', 'stt-extract')
   * @param userId - User identifier
   * @param priority - Request priority level
   * @returns Rate limit result with allowed status and remaining quota
   */
  checkQuota(
    pipeline: string,
    userId: string,
    priority: RateLimitPriority
  ): Promise<RateLimitResult>;

  /**
   * Increment usage counter after successful API call.
   * Only called after the external API returns successfully.
   * Failed requests do not count against quota.
   * 
   * @param pipeline - Pipeline identifier
   * @param userId - User identifier
   */
  incrementUsage(pipeline: string, userId: string): Promise<void>;

  /**
   * Get current usage for a user across all pipelines.
   * Used for per-user cap enforcement (150 calls/day).
   * 
   * @param userId - User identifier
   * @returns Total usage count for today
   */
  getTotalUsage(userId: string): Promise<number>;

  /**
   * Cleanup expired rate limit keys (>7 days old).
   * Run periodically to prevent storage bloat.
   */
  cleanupExpiredKeys(): Promise<void>;
}

/**
 * Supabase KV storage key format:
 * `rl:{date}:{userId}:{pipeline}`
 * 
 * Example: `rl:2026-11-06:user_123:ocr-meter`
 * 
 * This format enables:
 * - Efficient date-based queries (prefix scan by date)
 * - Per-user per-pipeline tracking
 * - Easy cleanup of expired keys
 */
export interface RateLimitStorageValue {
  /** Number of requests made in current period */
  count: number;
  
  /** When the quota resets (ISO 8601) */
  resetAt: string;
  
  /** When the first request was made (ISO 8601) */
  firstUsedAt: string;
}

/**
 * Rate limiting constants for AI Gateway.
 * 
 * Based on free tier limits:
 * - Gemini 3.5 Flash-Lite: 500 requests per day (RPD)
 * - AssemblyAI: 185 hours total (tracked separately by audio duration)
 * 
 * Priority allocation distributes the 500 RPD across pipelines:
 * - High (OCR): 40% = 200 calls/day (core value proposition)
 * - Medium (Explain, STT): 20% each = 100 calls/day
 * - Low (Terra): 20% = 100 calls/day (fallback available)
 */

export const RATE_LIMIT_CONSTANTS = {
  /** Total Gemini daily quota (free tier) */
  GEMINI_DAILY_QUOTA: 500,

  /** AssemblyAI total free tier hours */
  ASSEMBLYAI_TOTAL_HOURS: 185,

  /** Alert threshold (85% of quota) */
  ALERT_THRESHOLD_PERCENT: 85,

  /** Maximum calls per user per day (across all pipelines) */
  PER_USER_DAILY_CAP: 150,

  /** TTL for expired keys in days */
  EXPIRED_KEY_TTL_DAYS: 7,
} as const;

/**
 * Pipeline quota allocations by priority.
 * Sum of all allocations should equal GEMINI_DAILY_QUOTA (500).
 */
export const PIPELINE_QUOTAS: Record<string, { high: number; medium: number; low: number }> = {
  'ocr-meter': { high: 200, medium: 100, low: 50 },
  'ocr-label': { high: 0, medium: 100, low: 50 },
  'ocr-token': { high: 0, medium: 100, low: 50 },
  'stt-extract': { high: 0, medium: 100, low: 50 },
  'explain': { high: 0, medium: 100, low: 50 },
  'ask': { high: 0, medium: 0, low: 100 },
} as const;

/**
 * Priority tier definitions.
 * Higher priority pipelines get larger quota allocations.
 */
export const PRIORITY_TIERS = {
  /** Core value features (OCR meter reading) */
  high: 'high',
  
  /** Important but has fallback (Explain, STT, other OCR) */
  medium: 'medium',
  
  /** Nice-to-have with good fallback (Terra chat) */
  low: 'low',
} as const;

/**
 * Get quota allocation for a pipeline at a given priority.
 * Returns 50 calls/day as default for unknown pipelines.
 */
export function getQuotaForPipeline(
  pipeline: string,
  priority: keyof typeof PRIORITY_TIERS
): number {
  const allocation = PIPELINE_QUOTAS[pipeline];
  return allocation?.[priority] ?? 50;
}

/**
 * Calculate midnight Pacific Time (quota reset time).
 * RPD resets at midnight PT (UTC-8 or UTC-7 depending on DST).
 * 
 * @param now - Current date (defaults to now)
 * @returns Date object representing next midnight PT
 */
export function getNextMidnightPacific(now: Date = new Date()): Date {
  // Pacific Time offset: -8 hours (PST) or -7 hours (PDT)
  // For simplicity, use fixed UTC-8 (will be accurate most of the year)
  const pacificOffset = -8 * 60; // minutes
  
  // Convert to Pacific Time
  const pacificNow = new Date(now.getTime() + pacificOffset * 60 * 1000);
  
  // Get midnight Pacific
  const midnightPacific = new Date(pacificNow);
  midnightPacific.setHours(0, 0, 0, 0);
  midnightPacific.setDate(midnightPacific.getDate() + 1); // next day
  
  // Convert back to UTC
  return new Date(midnightPacific.getTime() - pacificOffset * 60 * 1000);
}

/**
 * Format date for storage key (YYYY-MM-DD in Pacific Time).
 * 
 * @param date - Date to format (defaults to now)
 * @returns Date string in Pacific Time
 */
export function formatDateKeyPacific(date: Date = new Date()): string {
  const pacificOffset = -8 * 60;
  const pacificDate = new Date(date.getTime() + pacificOffset * 60 * 1000);
  
  const year = pacificDate.getUTCFullYear();
  const month = String(pacificDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(pacificDate.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Build storage key for rate limiting.
 * Format: `rl:{date}:{userId}:{pipeline}`
 * 
 * @param userId - User identifier
 * @param pipeline - Pipeline identifier
 * @param date - Date (defaults to now in Pacific Time)
 * @returns Storage key
 */
export function buildRateLimitKey(
  userId: string,
  pipeline: string,
  date?: Date
): string {
  const dateKey = formatDateKeyPacific(date);
  return `rl:${dateKey}:${userId}:${pipeline}`;
}

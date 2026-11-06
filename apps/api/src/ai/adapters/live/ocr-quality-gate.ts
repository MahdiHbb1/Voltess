/**
 * Quality gate for OCR results.
 * 
 * Enforces minimum confidence thresholds and retry logic
 * per PRD Section 8 and VOLT-32 acceptance criteria.
 */

export interface QualityGateConfig {
  /** Minimum confidence to accept result (default: 0.85 for high, 0.65 for medium) */
  minConfidence: number;
  /** Maximum retry attempts before manual fallback (default: 2) */
  maxRetries: number;
  /** Pipelines that require high confidence */
  highConfidencePipelines: string[];
}

export interface OcrResult {
  confidence: 'high' | 'medium' | 'low';
  needs_retake: boolean;
  warnings: string[];
}

export const DEFAULT_QUALITY_GATE_CONFIG: QualityGateConfig = {
  minConfidence: 0.85,
  maxRetries: 2,
  highConfidencePipelines: ['ocr-meter'], // Meter reading critical
};

/**
 * Check if OCR result passes quality gate.
 * 
 * @param result - OCR result with confidence level
 * @param pipeline - Pipeline identifier
 * @param retryCount - Current retry attempt (0-indexed)
 * @param config - Quality gate configuration
 * @returns Gate decision with action
 */
export function checkQualityGate(
  result: OcrResult,
  pipeline: string,
  retryCount: number,
  config: QualityGateConfig = DEFAULT_QUALITY_GATE_CONFIG
): QualityGateDecision {
  const requiresHigh = config.highConfidencePipelines.includes(pipeline);

  // High confidence: always pass
  if (result.confidence === 'high') {
    return {
      action: 'accept',
      reason: 'high_confidence',
      canRetry: false,
    };
  }

  // Medium confidence: accept for non-critical pipelines
  if (result.confidence === 'medium' && !requiresHigh) {
    return {
      action: 'accept',
      reason: 'medium_confidence_acceptable',
      canRetry: false,
      warnings: ['Hasil kurang pasti. Periksa kembali ya.'],
    };
  }

  // Low confidence or medium on critical pipeline
  if (retryCount < config.maxRetries) {
    return {
      action: 'retry',
      reason: result.confidence === 'low' ? 'low_confidence' : 'medium_on_critical',
      canRetry: true,
      retryCount: retryCount + 1,
      message: buildRetryMessage(retryCount + 1, config.maxRetries),
    };
  }

  // Max retries exceeded: fallback to manual
  return {
    action: 'manual_fallback',
    reason: 'max_retries_exceeded',
    canRetry: false,
    message: buildFallbackMessage(pipeline),
  };
}

/**
 * Build user-friendly retry message.
 */
function buildRetryMessage(attemptNumber: number, maxRetries: number): string {
  const remaining = maxRetries - attemptNumber + 1;
  
  if (attemptNumber === 1) {
    return 'Foto kurang jelas. Coba foto ulang dengan pencahayaan lebih baik.';
  }
  
  return `Masih kurang jelas (percobaan ${attemptNumber}/${maxRetries}). ${
    remaining > 0 
      ? `Coba lagi dengan:\n- Cahaya lebih terang\n- Kamera lebih stabil\n- Jarak lebih dekat`
      : 'Masukkan data manual jika foto tetap tidak terbaca.'
  }`;
}

/**
 * Build manual fallback message by pipeline.
 */
function buildFallbackMessage(pipeline: string): string {
  const messages: Record<string, string> = {
    'ocr-meter': 'Foto meter tidak terbaca. Ketik angka kWh manual ya.',
    'ocr-label': 'Label tidak terbaca. Pilih alat dari daftar atau ketik manual.',
    'ocr-token': 'Struk tidak terbaca. Ketik nominal dan kWh manual.',
  };
  
  return messages[pipeline] || 'Foto tidak terbaca. Masukkan data manual.';
}

/**
 * Quality gate decision result.
 */
export interface QualityGateDecision {
  /** Action to take: accept, retry, or manual fallback */
  action: 'accept' | 'retry' | 'manual_fallback';
  
  /** Reason for decision */
  reason: string;
  
  /** Whether retry is allowed */
  canRetry: boolean;
  
  /** Current retry count (if retrying) */
  retryCount?: number;
  
  /** User-facing message */
  message?: string;
  
  /** Non-blocking warnings */
  warnings?: string[];
}

/**
 * Aggregate quality metrics for admin dashboard (VOLT-35).
 * 
 * @param results - Array of OCR results with metadata
 * @returns Quality metrics summary
 */
export function aggregateQualityMetrics(
  results: Array<{ confidence: string; corrected_by_user: boolean; pipeline: string }>
): QualityMetrics {
  const total = results.length;
  if (total === 0) {
    return {
      total: 0,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      correctionRate: 0,
      byPipeline: {},
    };
  }

  const high = results.filter(r => r.confidence === 'high').length;
  const medium = results.filter(r => r.confidence === 'medium').length;
  const low = results.filter(r => r.confidence === 'low').length;
  const corrected = results.filter(r => r.corrected_by_user).length;

  const byPipeline: Record<string, { count: number; avgConfidence: number }> = {};
  for (const result of results) {
    if (!byPipeline[result.pipeline]) {
      byPipeline[result.pipeline] = { count: 0, avgConfidence: 0 };
    }
    byPipeline[result.pipeline]!.count += 1;
  }

  return {
    total,
    highConfidence: high,
    mediumConfidence: medium,
    lowConfidence: low,
    correctionRate: corrected / total,
    byPipeline,
  };
}

export interface QualityMetrics {
  total: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  /** Fraction of results corrected by user (0-1) */
  correctionRate: number;
  byPipeline: Record<string, { count: number; avgConfidence: number }>;
}

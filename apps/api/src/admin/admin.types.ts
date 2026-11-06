export interface FunnelEvent {
  event: 'capture_start' | 'capture_success' | 'ocr_start' | 'ocr_success' | 'ocr_fail' | 'correction';
  userId: string;
  businessId: string;
  pipeline: 'ocr-meter' | 'ocr-label' | 'ocr-token' | 'stt';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AccuracyMetric {
  pipeline: string;
  totalCalls: number;
  correctedByUser: number;
  accuracy: number; // 1 - (correctedByUser / totalCalls)
}

export interface CostMetric {
  userId: string;
  pipeline: string;
  totalCalls: number;
  totalCost: number;
  avgLatencyMs: number;
  period: { start: Date; end: Date };
}

export interface AdminFunnelResponse {
  period: { start: Date; end: Date };
  events: Array<{ event: string; count: number }>;
  dropoffRate: number;
}

export interface AdminAccuracyResponse {
  period: { start: Date; end: Date };
  byPipeline: AccuracyMetric[];
  overall: number;
}

export interface AdminCostResponse {
  period: { start: Date; end: Date };
  byUser: CostMetric[];
  totalCost: number;
  avgLatency: number;
}

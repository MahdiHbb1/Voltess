import { Injectable } from '@nestjs/common';
import {
  FunnelEvent,
  AccuracyMetric,
  CostMetric,
  AdminFunnelResponse,
  AdminAccuracyResponse,
  AdminCostResponse,
} from './admin.types';

@Injectable()
export class AdminService {
  // ponytail: in-memory store, use DB when persistence needed
  private funnelEvents: FunnelEvent[] = [];
  private correctionLog = new Map<string, { total: number; corrected: number }>();
  private costLog: CostMetric[] = [];

  trackEvent(event: FunnelEvent): void {
    this.funnelEvents.push(event);

    // Track corrections for accuracy
    if (event.event === 'ocr_success') {
      const key = event.pipeline;
      const current = this.correctionLog.get(key) || { total: 0, corrected: 0 };
      current.total += 1;
      this.correctionLog.set(key, current);
    }

    if (event.event === 'correction') {
      const key = event.pipeline;
      const current = this.correctionLog.get(key) || { total: 0, corrected: 0 };
      current.corrected += 1;
      this.correctionLog.set(key, current);
    }
  }

  trackCost(metric: CostMetric): void {
    this.costLog.push(metric);
  }

  getFunnelMetrics(start: Date, end: Date): AdminFunnelResponse {
    const filtered = this.funnelEvents.filter(
      (e) => e.timestamp >= start && e.timestamp <= end,
    );

    const counts = new Map<string, number>();
    for (const event of filtered) {
      counts.set(event.event, (counts.get(event.event) || 0) + 1);
    }

    const captureStart = counts.get('capture_start') || 0;
    const ocrSuccess = counts.get('ocr_success') || 0;
    const dropoffRate = captureStart > 0 ? 1 - ocrSuccess / captureStart : 0;

    return {
      period: { start, end },
      events: Array.from(counts.entries()).map(([event, count]) => ({ event, count })),
      dropoffRate,
    };
  }

  getAccuracyMetrics(start: Date, end: Date): AdminAccuracyResponse {
    const metrics: AccuracyMetric[] = [];

    for (const [pipeline, stats] of this.correctionLog.entries()) {
      const accuracy = stats.total > 0 ? 1 - stats.corrected / stats.total : 0;
      metrics.push({
        pipeline,
        totalCalls: stats.total,
        correctedByUser: stats.corrected,
        accuracy,
      });
    }

    const overall =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length
        : 0;

    return {
      period: { start, end },
      byPipeline: metrics,
      overall,
    };
  }

  getCostMetrics(start: Date, end: Date): AdminCostResponse {
    const filtered = this.costLog.filter(
      (m) => m.period.start >= start && m.period.end <= end,
    );

    const totalCost = filtered.reduce((sum, m) => sum + m.totalCost, 0);
    const avgLatency =
      filtered.length > 0
        ? filtered.reduce((sum, m) => sum + m.avgLatencyMs, 0) / filtered.length
        : 0;

    return {
      period: { start, end },
      byUser: filtered,
      totalCost,
      avgLatency,
    };
  }

  async exportCostCSV(start: Date, end: Date): Promise<string> {
    const filtered = this.costLog.filter(
      (m) => m.period.start >= start && m.period.end <= end,
    );

    const header = 'userId,pipeline,totalCalls,totalCost,avgLatencyMs\n';
    const rows = filtered
      .map(
        (m) =>
          `${m.userId},${m.pipeline},${m.totalCalls},${m.totalCost},${m.avgLatencyMs}`,
      )
      .join('\n');

    return header + rows;
  }
}

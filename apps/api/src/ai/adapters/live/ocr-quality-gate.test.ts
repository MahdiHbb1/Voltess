import { describe, it, expect } from 'vitest';
import {
  checkQualityGate,
  DEFAULT_QUALITY_GATE_CONFIG,
  aggregateQualityMetrics,
  type OcrResult,
} from './ocr-quality-gate';

describe('OCR Quality Gate', () => {
  describe('checkQualityGate', () => {
    it('accepts high confidence immediately', () => {
      const result: OcrResult = {
        confidence: 'high',
        needs_retake: false,
        warnings: [],
      };

      const decision = checkQualityGate(result, 'ocr-meter', 0);

      expect(decision.action).toBe('accept');
      expect(decision.reason).toBe('high_confidence');
      expect(decision.canRetry).toBe(false);
    });

    it('accepts medium confidence for non-critical pipelines', () => {
      const result: OcrResult = {
        confidence: 'medium',
        needs_retake: false,
        warnings: [],
      };

      const decision = checkQualityGate(result, 'ocr-label', 0);

      expect(decision.action).toBe('accept');
      expect(decision.reason).toBe('medium_confidence_acceptable');
      expect(decision.warnings).toContain('Hasil kurang pasti. Periksa kembali ya.');
    });

    it('retries medium confidence on critical pipeline', () => {
      const result: OcrResult = {
        confidence: 'medium',
        needs_retake: true,
        warnings: [],
      };

      const decision = checkQualityGate(result, 'ocr-meter', 0);

      expect(decision.action).toBe('retry');
      expect(decision.reason).toBe('medium_on_critical');
      expect(decision.canRetry).toBe(true);
      expect(decision.retryCount).toBe(1);
    });

    it('retries low confidence up to max retries', () => {
      const result: OcrResult = {
        confidence: 'low',
        needs_retake: true,
        warnings: [],
      };

      const decision1 = checkQualityGate(result, 'ocr-meter', 0);
      expect(decision1.action).toBe('retry');
      expect(decision1.retryCount).toBe(1);

      const decision2 = checkQualityGate(result, 'ocr-meter', 1);
      expect(decision2.action).toBe('retry');
      expect(decision2.retryCount).toBe(2);
    });

    it('falls back to manual after max retries', () => {
      const result: OcrResult = {
        confidence: 'low',
        needs_retake: true,
        warnings: [],
      };

      const decision = checkQualityGate(
        result,
        'ocr-meter',
        DEFAULT_QUALITY_GATE_CONFIG.maxRetries
      );

      expect(decision.action).toBe('manual_fallback');
      expect(decision.reason).toBe('max_retries_exceeded');
      expect(decision.message).toContain('manual');
    });

    it('provides helpful retry messages', () => {
      const result: OcrResult = {
        confidence: 'low',
        needs_retake: true,
        warnings: [],
      };

      const decision1 = checkQualityGate(result, 'ocr-meter', 0);
      expect(decision1.message).toContain('Foto kurang jelas');

      const decision2 = checkQualityGate(result, 'ocr-meter', 1);
      expect(decision2.message).toContain('percobaan');
    });

    it('provides pipeline-specific fallback messages', () => {
      const result: OcrResult = {
        confidence: 'low',
        needs_retake: true,
        warnings: [],
      };

      const decisionMeter = checkQualityGate(result, 'ocr-meter', 2);
      expect(decisionMeter.message).toContain('angka kWh manual');

      const decisionLabel = checkQualityGate(result, 'ocr-label', 2);
      expect(decisionLabel.message).toContain('pilih alat');
    });
  });

  describe('aggregateQualityMetrics', () => {
    it('handles empty results', () => {
      const metrics = aggregateQualityMetrics([]);

      expect(metrics.total).toBe(0);
      expect(metrics.correctionRate).toBe(0);
    });

    it('calculates confidence distribution', () => {
      const results = [
        { confidence: 'high', corrected_by_user: false, pipeline: 'ocr-meter' },
        { confidence: 'high', corrected_by_user: false, pipeline: 'ocr-meter' },
        { confidence: 'medium', corrected_by_user: true, pipeline: 'ocr-label' },
        { confidence: 'low', corrected_by_user: true, pipeline: 'ocr-token' },
      ];

      const metrics = aggregateQualityMetrics(results);

      expect(metrics.total).toBe(4);
      expect(metrics.highConfidence).toBe(2);
      expect(metrics.mediumConfidence).toBe(1);
      expect(metrics.lowConfidence).toBe(1);
      expect(metrics.correctionRate).toBe(0.5); // 2/4
    });

    it('groups metrics by pipeline', () => {
      const results = [
        { confidence: 'high', corrected_by_user: false, pipeline: 'ocr-meter' },
        { confidence: 'high', corrected_by_user: false, pipeline: 'ocr-meter' },
        { confidence: 'medium', corrected_by_user: false, pipeline: 'ocr-label' },
      ];

      const metrics = aggregateQualityMetrics(results);

      expect(metrics.byPipeline['ocr-meter'].count).toBe(2);
      expect(metrics.byPipeline['ocr-label'].count).toBe(1);
    });
  });
});

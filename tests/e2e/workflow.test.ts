/**
 * E2E Workflow Test: Capture → OCR → Estimate → Recommendation
 * 
 * Tests the complete user journey from capture creation through
 * to receiving personalized energy recommendations.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { 
  Capture,
  OcrMeterResponse, 
  EstimateResult, 
  RecommendResponse 
} from '@voltess/contracts';

const API_BASE = process.env.API_URL || 'http://localhost:3001';

describe('E2E: Complete Energy Analysis Workflow', () => {
  let captureId: string;
  let meterKwh: number;
  
  it('Step 1: Create capture with photo', async () => {
    const response = await request(API_BASE)
      .post('/capture')
      .send({
        business_id: 'test_business_e2e',
        open_photo_ref: 'https://example.com/meter-photo.jpg',
        close_photos: [],
        metadata: { device: 'test', timestamp: new Date().toISOString() },
      })
      .expect(201);

    const capture: Capture = response.body;
    expect(capture.capture_id).toBeDefined();
    expect(capture.status).toBe('pending');
    
    captureId = capture.capture_id;
    console.log('✓ Capture created:', captureId);
  });

  it('Step 2: Run OCR on meter photo', async () => {
    const response = await request(API_BASE)
      .post('/ai/ocr-meter')
      .send({
        business_id: 'test_business_e2e',
        image_ref: 'https://example.com/meter-photo.jpg',
      })
      .expect(200);

    const ocr: OcrMeterResponse = response.body;
    expect(ocr.kwh).toBeGreaterThan(0);
    expect(ocr.unit).toBe('kWh');
    expect(ocr.needs_retake).toBe(false);
    
    meterKwh = ocr.kwh;
    console.log('✓ OCR result:', meterKwh, 'kWh');
  });

  it('Step 3: Calculate estimate with appliances', async () => {
    const response = await request(API_BASE)
      .post('/estimate/v0')
      .send({
        window: { 
          start: '2026-11-01T00:00:00+07:00', 
          end: '2026-11-30T23:59:59+07:00' 
        },
        appliances: [
          { appliance_id: 'kulkas', power_kw: 0.15, hours: 720, load_factor: 0.8 },
          { appliance_id: 'tv', power_kw: 0.1, hours: 180, load_factor: 1.0 },
          { appliance_id: 'ac', power_kw: 1.0, hours: 240, load_factor: 0.7 },
        ],
        meter_delta_kwh: meterKwh,
        data_days: 30,
        engine_version: '0.1.0',
      })
      .expect(200);

    const estimate: EstimateResult = response.body;
    expect(estimate.explained_kwh).toBeGreaterThan(0);
    expect(estimate.overall_confidence).toMatch(/high|medium|low/);
    expect(estimate.per_appliance).toHaveLength(3);
    
    console.log('✓ Estimate:', {
      explained: estimate.explained_kwh,
      unexplained: estimate.unexplained_kwh,
      confidence: estimate.overall_confidence,
    });
  });

  it('Step 4: Get personalized recommendations', async () => {
    const response = await request(API_BASE)
      .post('/estimate/recommend')
      .send({
        input: {
          window: { 
            start: '2026-11-01T00:00:00+07:00', 
            end: '2026-11-30T23:59:59+07:00' 
          },
          appliances: [
            { appliance_id: 'kulkas', power_kw: 0.15, hours: 720, load_factor: 0.8 },
            { appliance_id: 'tv', power_kw: 0.1, hours: 180, load_factor: 1.0 },
            { appliance_id: 'ac', power_kw: 1.0, hours: 240, load_factor: 0.7 },
          ],
          meter_delta_kwh: meterKwh,
          data_days: 30,
          engine_version: '0.1.0',
        },
        tariff_rp_per_kwh: 1444,
      })
      .expect(200);

    const recommendations: RecommendResponse = response.body;
    expect(recommendations.recommendations).toBeDefined();
    expect(recommendations.recommendations.length).toBeGreaterThan(0);
    expect(recommendations.recommendations.length).toBeLessThanOrEqual(3);
    
    for (const rec of recommendations.recommendations) {
      expect(rec.action_id).toBeDefined();
      expect(rec.title).toBeDefined();
      expect(rec.est_saving_kwh.min).toBeGreaterThan(0);
      expect(rec.est_saving_rp.min).toBeGreaterThan(0);
      expect(rec.confidence).toMatch(/high|medium|low/);
      expect(rec.effort).toMatch(/low|medium|high/);
      expect(rec.score).toBeGreaterThan(0);
    }
    
    console.log('✓ Recommendations:', recommendations.recommendations.length, 'items');
    const topRecommendation = recommendations.recommendations[0];
    expect(topRecommendation).toBeDefined();
    if (!topRecommendation) {
      throw new Error('Expected at least one recommendation');
    }
    console.log('  Top:', topRecommendation.title);
  });

  it('Step 5: Complete workflow - capture to recommendations in one flow', async () => {
    // Full integration: capture → OCR → estimate → recommend
    const captureRes = await request(API_BASE)
      .post('/capture')
      .send({
        business_id: 'test_business_e2e_full',
        open_photo_ref: 'https://example.com/meter-photo-2.jpg',
        close_photos: [],
        metadata: {},
      });
    
    const ocrRes = await request(API_BASE)
      .post('/ai/ocr-meter')
      .send({
        business_id: 'test_business_e2e_full',
        image_ref: 'https://example.com/meter-photo-2.jpg',
      });
    
    const estimateRes = await request(API_BASE)
      .post('/estimate/v0')
      .send({
        window: { start: '2026-11-01T00:00:00+07:00', end: '2026-11-30T23:59:59+07:00' },
        appliances: [
          { appliance_id: 'ac', power_kw: 1.5, hours: 300, load_factor: 0.7 },
        ],
        meter_delta_kwh: ocrRes.body.kwh,
        data_days: 30,
        engine_version: '0.1.0',
      });
    
    const recommendRes = await request(API_BASE)
      .post('/estimate/recommend')
      .send({
        input: {
          window: { start: '2026-11-01T00:00:00+07:00', end: '2026-11-30T23:59:59+07:00' },
          appliances: [
            { appliance_id: 'ac', power_kw: 1.5, hours: 300, load_factor: 0.7 },
          ],
          meter_delta_kwh: ocrRes.body.kwh,
          data_days: 30,
          engine_version: '0.1.0',
        },
        tariff_rp_per_kwh: 1444,
      });

    expect(captureRes.status).toBe(201);
    expect(ocrRes.status).toBe(200);
    expect(estimateRes.status).toBe(200);
    expect(recommendRes.status).toBe(200);
    
    console.log('✓ Complete workflow verified end-to-end');
  });
});

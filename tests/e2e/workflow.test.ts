import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type {
  EstimateResponse,
  OcrMeterResponse,
  RecommendResponse,
} from '@voltess/contracts';

describe('E2E: Complete Energy Analysis Workflow', () => {
  let app: INestApplication;
  let estimate: EstimateResponse;

  beforeAll(async () => {
    process.env.AI_MODE = 'mock';
    const { AppModule } = await import('../../apps/api/src/app.module');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs OCR on a meter image', async () => {
    const response = await request(app.getHttpServer())
      .post('/ai/ocr-meter')
      .field('meter_type', 'prabayar')
      .attach('file', Buffer.from('meter image'), {
        filename: 'meter.png',
        contentType: 'image/png',
      })
      .expect(200);

    const ocr: OcrMeterResponse = response.body;
    expect(ocr.kwh).toBeGreaterThan(0);
    expect(ocr.unit).toBe('kWh');
    expect(ocr.needs_retake).toBe(false);
  });

  it('calculates an estimate from appliance usage', async () => {
    const response = await request(app.getHttpServer())
      .post('/ai/estimate')
      .send({
        business_id: 'test_business_e2e',
        window: {
          start: '2026-11-01T00:00:00+07:00',
          end: '2026-11-30T23:59:59+07:00',
        },
        appliances: [
          { appliance_id: 'kulkas', power_kw: 0.15, hours: 720, load_factor: 0.8 },
          { appliance_id: 'tv', power_kw: 0.1, hours: 180, load_factor: 1 },
          { appliance_id: 'ac', power_kw: 1, hours: 240, load_factor: 0.7 },
        ],
        meter_delta_kwh: 300,
        data_days: 30,
      })
      .expect(200);

    estimate = response.body;
    expect(estimate.explained_kwh).toBeGreaterThan(0);
    expect(estimate.per_appliance.length).toBeGreaterThan(0);
  });

  it('returns personalized recommendations for the estimate', async () => {
    const response = await request(app.getHttpServer())
      .post('/ai/recommend')
      .send({
        business_id: 'test_business_e2e',
        estimate,
        template_id: 'T01',
        unit_label: 'kWh',
      })
      .expect(200);

    const recommendations: RecommendResponse = response.body;
    expect(recommendations.recommendations.length).toBeGreaterThan(0);
    expect(recommendations.recommendations.length).toBeLessThanOrEqual(3);
  });
});

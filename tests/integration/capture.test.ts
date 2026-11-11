import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';
import type { BusinessProfile, Capture } from '@voltess/contracts';

describe('Capture Integration', () => {
  let app: INestApplication;
  let businessId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((request: Request & { userId?: string }, _response: Response, next: NextFunction) => {
      request.userId = 'usr_mock_current';
      next();
    });
    await app.init();

    const businessRes = await request(app.getHttpServer())
      .post('/business/profile')
      .send({
        business_name: 'Warung Test',
        template_id: 'T01',
        electricity_rate: 1444,
        billing_type: 'prepaid',
      })
      .expect(201);

    const business: BusinessProfile = businessRes.body;
    businessId = business.business_id;
  });

  afterAll(async () => {
    await app.close();
  });

  function createCapture(): request.Test {
    return request(app.getHttpServer())
      .post('/captures')
      .field('business_id', businessId)
      .field('type', 'label')
      .attach('file', Buffer.from('label image'), {
        filename: 'label.png',
        contentType: 'image/png',
      });
  }

  it('creates a queued label capture', async () => {
    const res = await createCapture().expect(201);
    const capture: Capture & { job_id?: string } = res.body;

    expect(capture.capture_id).toBeTruthy();
    expect(capture.type).toBe('label');
    expect(capture.status).toBe('queued');
    expect(capture.result).toBeNull();
    expect(capture.job_id).toBeTruthy();
  });

  it('rejects label capture without a file', async () => {
    await request(app.getHttpServer())
      .post('/captures')
      .field('business_id', businessId)
      .field('type', 'label')
      .expect(400);
  });

  it('does not verify a capture before OCR processing completes', async () => {
    const createRes = await createCapture().expect(201);
    const capture: Capture = createRes.body;

    await request(app.getHttpServer())
      .post(`/captures/${capture.capture_id}/verify`)
      .send({ confirmed: true })
      .expect(400);
  });

  it('returns a queued capture by ID', async () => {
    const createRes = await createCapture().expect(201);
    const capture: Capture = createRes.body;

    const getRes = await request(app.getHttpServer())
      .get(`/captures/${capture.capture_id}`)
      .expect(200);

    const fetched: Capture = getRes.body;
    expect(fetched.capture_id).toBe(capture.capture_id);
    expect(fetched.status).toBe('queued');
  });

  it('returns 404 for an unknown capture', async () => {
    await request(app.getHttpServer())
      .get('/captures/unknown')
      .expect(404);
  });
});

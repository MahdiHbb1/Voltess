import { describe, it, expect, beforeEach } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import type {
  Capture,
  CreateCaptureRequest,
  VerifyCaptureRequest,
  BusinessProfilePayload,
} from '@voltra/contracts';

describe('Capture Integration', () => {
  let app: INestApplication;
  let authToken: string;
  let businessId: string;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // Register + verify OTP
    await fetch(`http://localhost:${app.getHttpServer().address().port}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+6281234567890' }),
    });

    const verifyRes = await fetch(
      `http://localhost:${app.getHttpServer().address().port}/auth/verify-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+6281234567890', otp: '123456' }),
      },
    );
    const verifyData = await verifyRes.json();
    authToken = verifyData.access_token;

    // Create business profile
    const bizPayload: BusinessProfilePayload = {
      business_name: 'Warung Test',
      template_id: 'T01',
      electricity_rate: 1444,
      billing_type: 'prepaid',
    };

    const bizRes = await fetch(
      `http://localhost:${app.getHttpServer().address().port}/business`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(bizPayload),
      },
    );
    const bizData = await bizRes.json();
    businessId = bizData.business_id;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /captures', () => {
    it('creates label capture and calls OCR mock', async () => {
      const payload: CreateCaptureRequest = {
        business_id: businessId,
        type: 'label',
        image_data: 'base64_stub_data',
      };

      const res = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      expect(res.status).toBe(201);
      const capture: Capture = await res.json();

      expect(capture.capture_id).toBeTruthy();
      expect(capture.type).toBe('label');
      expect(capture.status).toBe('pending'); // mock high confidence
      expect(capture.result).toEqual({
        name: 'Kulkas 2 Pintu',
        power_w: 150,
        brand: 'Samsung',
      });
      expect(capture.confidence).toBe('high');
    });

    it('rejects label capture without image_data', async () => {
      const payload = {
        business_id: businessId,
        type: 'label',
      };

      const res = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      expect(res.status).toBe(400);
    });
  });

  describe('POST /captures/:id/verify', () => {
    it('verifies capture, adds appliance, creates mission event', async () => {
      // Create capture
      const createPayload: CreateCaptureRequest = {
        business_id: businessId,
        type: 'label',
        image_data: 'base64_stub',
      };

      const createRes = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(createPayload),
        },
      );
      const capture: Capture = await createRes.json();

      // Verify
      const verifyPayload: VerifyCaptureRequest = {
        confirmed: true,
      };

      const verifyRes = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures/${capture.capture_id}/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(verifyPayload),
        },
      );

      expect(verifyRes.status).toBe(200);
      const verified: Capture = await verifyRes.json();
      expect(verified.status).toBe('verified');

      // Check appliance added to business
      const bizRes = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/business/${businessId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      const business = await bizRes.json();
      expect(business.appliances).toHaveLength(1);
      expect(business.appliances[0].name).toBe('Kulkas 2 Pintu');
      expect(business.appliances[0].verified).toBe(true);
      expect(business.appliances[0].source).toBe('label');
    });

    it('rejects capture when confirmed=false', async () => {
      const createPayload: CreateCaptureRequest = {
        business_id: businessId,
        type: 'label',
        image_data: 'base64_stub',
      };

      const createRes = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(createPayload),
        },
      );
      const capture: Capture = await createRes.json();

      const verifyPayload: VerifyCaptureRequest = {
        confirmed: false,
      };

      const verifyRes = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures/${capture.capture_id}/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(verifyPayload),
        },
      );

      const rejected: Capture = await verifyRes.json();
      expect(rejected.status).toBe('rejected');
    });
  });

  describe('GET /captures/:id', () => {
    it('returns capture by ID', async () => {
      const createPayload: CreateCaptureRequest = {
        business_id: businessId,
        type: 'label',
        image_data: 'base64_stub',
      };

      const createRes = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(createPayload),
        },
      );
      const capture: Capture = await createRes.json();

      const getRes = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures/${capture.capture_id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      expect(getRes.status).toBe(200);
      const fetched: Capture = await getRes.json();
      expect(fetched.capture_id).toBe(capture.capture_id);
    });

    it('returns 404 for unknown capture', async () => {
      const res = await fetch(
        `http://localhost:${app.getHttpServer().address().port}/captures/unknown`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      expect(res.status).toBe(404);
    });
  });
});

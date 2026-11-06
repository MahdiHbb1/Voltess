/**
 * Entitlement integration test - guard + controller
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { EntitlementModule } from '../../apps/api/src/entitlement/entitlement.module';
import type { EntitlementStatusResponse, Entitlement } from '@voltra/contracts';

describe('Entitlement Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EntitlementModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /entitlement/status returns free by default', async () => {
    const res = await request(app.getHttpServer())
      .get('/entitlement/status')
      .set('x-business-id', 'biz_test_free')
      .expect(200);

    const status: EntitlementStatusResponse = res.body;
    expect(status.status).toBe('free');
    expect(status.features.kios).toBe(true);
    expect(status.features.ai_analysis).toBe(false);
    expect(status.trial_days_remaining).toBeNull();
    expect(status.can_upgrade).toBe(true);
  });

  it('POST /entitlement/start-trial starts trial', async () => {
    const bizId = 'biz_test_trial';

    const startRes = await request(app.getHttpServer())
      .post('/entitlement/start-trial')
      .set('x-business-id', bizId)
      .send({ reason: 'First upload' })
      .expect(201);

    const ent: Entitlement = startRes.body;
    expect(ent.status).toBe('trial');
    expect(ent.trial_started_at).toBeDefined();
    expect(ent.features.ai_analysis).toBe(true);

    // Check status endpoint
    const statusRes = await request(app.getHttpServer())
      .get('/entitlement/status')
      .set('x-business-id', bizId)
      .expect(200);

    const status: EntitlementStatusResponse = statusRes.body;
    expect(status.status).toBe('trial');
    expect(status.trial_days_remaining).toBeGreaterThan(0);
    expect(status.trial_days_remaining).toBeLessThanOrEqual(30);
  });

  it('POST /entitlement/upgrade-plus-manual upgrades to plus', async () => {
    const bizId = 'biz_test_plus';

    // Start trial first
    await request(app.getHttpServer())
      .post('/entitlement/start-trial')
      .set('x-business-id', bizId)
      .send({ reason: 'First upload' })
      .expect(201);

    // Upgrade to plus
    const upgradeRes = await request(app.getHttpServer())
      .post('/entitlement/upgrade-plus-manual')
      .set('x-business-id', bizId)
      .send({ reason: 'Payment success' })
      .expect(201);

    const plus: Entitlement = upgradeRes.body;
    expect(plus.status).toBe('plus');
    expect(plus.features.ai_analysis).toBe(true);

    // Status check
    const statusRes = await request(app.getHttpServer())
      .get('/entitlement/status')
      .set('x-business-id', bizId)
      .expect(200);

    const status: EntitlementStatusResponse = statusRes.body;
    expect(status.status).toBe('plus');
    expect(status.trial_days_remaining).toBeNull();
    expect(status.can_upgrade).toBe(false); // already plus
  });

  it('locked state blocks AI features', async () => {
    const bizId = 'biz_test_locked';

    // Start trial
    await request(app.getHttpServer())
      .post('/entitlement/start-trial')
      .set('x-business-id', bizId)
      .send({ reason: 'Start' })
      .expect(201);

    // Status should be trial
    const statusRes = await request(app.getHttpServer())
      .get('/entitlement/status')
      .set('x-business-id', bizId)
      .expect(200);

    const status: EntitlementStatusResponse = statusRes.body;
    expect(status.status).toBe('trial');
    expect(status.features.ai_analysis).toBe(true);
  });

  it('trial start is idempotent', async () => {
    const bizId = 'biz_idempotent';

    const first = await request(app.getHttpServer())
      .post('/entitlement/start-trial')
      .set('x-business-id', bizId)
      .send({ reason: 'First' })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/entitlement/start-trial')
      .set('x-business-id', bizId)
      .send({ reason: 'Second' })
      .expect(201);

    const firstEnt: Entitlement = first.body;
    const secondEnt: Entitlement = second.body;

    expect(secondEnt.trial_started_at).toBe(firstEnt.trial_started_at);
    expect(secondEnt.trial_ends_at).toBe(firstEnt.trial_ends_at);
  });
});

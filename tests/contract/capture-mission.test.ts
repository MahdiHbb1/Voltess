import { describe, it, expect } from 'vitest';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { Capture, MissionEvent } from '@voltra/contracts';

const ajv = new Ajv({ strict: true, allErrors: true });
addFormats(ajv);

describe('Contract: Capture & Mission', () => {
  describe('Capture', () => {
    const captureSchema = {
      type: 'object',
      required: [
        'capture_id',
        'business_id',
        'type',
        'file_ref',
        'status',
        'created_at',
        'updated_at',
      ],
      properties: {
        capture_id: { type: 'string' },
        business_id: { type: 'string' },
        type: { type: 'string', enum: ['label', 'meter', 'token'] },
        file_ref: { type: 'string' },
        result: { type: ['object', 'null'] },
        confidence: { type: ['string', 'null'], enum: ['high', 'medium', 'low', null] },
        status: {
          type: 'string',
          enum: ['pending', 'verified', 'rejected', 'needs_retake'],
        },
        request_id: { type: ['string', 'null'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
      additionalProperties: false,
    };

    const validate = ajv.compile(captureSchema);

    it('validates label capture', () => {
      const capture: Capture = {
        capture_id: 'cap_1',
        business_id: 'biz_1',
        type: 'label',
        file_ref: 'stub://label/123.jpg',
        result: { name: 'Kulkas', power_w: 150 },
        confidence: 'high',
        status: 'verified',
        request_id: 'req_123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(validate(capture)).toBe(true);
    });

    it('validates pending capture without result', () => {
      const capture: Capture = {
        capture_id: 'cap_2',
        business_id: 'biz_1',
        type: 'meter',
        file_ref: 'stub://meter/456.jpg',
        result: null,
        confidence: null,
        status: 'pending',
        request_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(validate(capture)).toBe(true);
    });

    it('rejects invalid status', () => {
      const capture = {
        capture_id: 'cap_3',
        business_id: 'biz_1',
        type: 'label',
        file_ref: 'stub://label/789.jpg',
        result: null,
        confidence: null,
        status: 'invalid_status',
        request_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(validate(capture)).toBe(false);
    });
  });

  describe('MissionEvent C4', () => {
    const missionSchema = {
      type: 'object',
      required: [
        'event_id',
        'type',
        'mission_id',
        'business_id',
        'occurred_at',
        'payload',
        'verification',
        'reward',
      ],
      properties: {
        event_id: { type: 'string' },
        type: { type: 'string', enum: ['mission_completed'] },
        mission_id: { type: 'string' },
        business_id: { type: 'string' },
        occurred_at: { type: 'string', format: 'date-time' },
        payload: { type: 'object' },
        verification: {
          type: 'object',
          required: ['status', 'reason', 'confidence'],
          properties: {
            status: { type: 'string', enum: ['verified', 'pending', 'rejected'] },
            reason: { type: ['string', 'null'] },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          },
        },
        reward: {
          type: 'object',
          required: ['points', 'badge'],
          properties: {
            points: { type: 'number' },
            badge: { type: ['string', 'null'] },
          },
        },
      },
      additionalProperties: false,
    };

    const validate = ajv.compile(missionSchema);

    it('validates M1 mission event', () => {
      const event: MissionEvent = {
        event_id: 'evt_1',
        type: 'mission_completed',
        mission_id: 'M1',
        business_id: 'biz_1',
        occurred_at: new Date().toISOString(),
        payload: { capture_id: 'cap_1' },
        verification: {
          status: 'verified',
          reason: null,
          confidence: 'high',
        },
        reward: {
          points: 10,
          badge: 'first_label',
        },
      };

      expect(validate(event)).toBe(true);
    });

    it('validates pending event', () => {
      const event: MissionEvent = {
        event_id: 'evt_2',
        type: 'mission_completed',
        mission_id: 'M2',
        business_id: 'biz_1',
        occurred_at: new Date().toISOString(),
        payload: {},
        verification: {
          status: 'pending',
          reason: 'Awaiting admin review',
          confidence: 'medium',
        },
        reward: {
          points: 0,
          badge: null,
        },
      };

      expect(validate(event)).toBe(true);
    });

    it('rejects invalid verification status', () => {
      const event = {
        event_id: 'evt_3',
        type: 'mission_completed',
        mission_id: 'M1',
        business_id: 'biz_1',
        occurred_at: new Date().toISOString(),
        payload: {},
        verification: {
          status: 'invalid',
          reason: null,
          confidence: 'high',
        },
        reward: { points: 10, badge: null },
      };

      expect(validate(event)).toBe(false);
    });
  });
});

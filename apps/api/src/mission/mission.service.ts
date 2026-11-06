import { randomUUID } from 'node:crypto';
import type {
  MissionEvent,
  MissionType,
  VerificationStatus,
  MissionPayload,
  Confidence,
} from '@voltra/contracts';

/** Mission event entity - DB model */
export interface MissionEventEntity {
  event_id: string;
  type: MissionType;
  mission_id: string;
  business_id: string;
  occurred_at: Date;
  payload: MissionPayload;
  verification: {
    status: VerificationStatus;
    reason: string | null;
    confidence: Confidence;
  };
  reward: {
    points: number;
    badge: string | null;
  };
}

/** In-memory mission store */
const missions = new Map<string, MissionEventEntity>();

export class MissionService {
  /** Clear store - for tests */
  clearAll(): void {
    missions.clear();
  }

  /** Create mission event */
  async createEvent(data: {
    type: MissionType;
    mission_id: string;
    business_id: string;
    payload: MissionPayload;
    verification: {
      status: VerificationStatus;
      reason: string | null;
      confidence: Confidence;
    };
    reward: {
      points: number;
      badge: string | null;
    };
  }): Promise<MissionEvent> {
    const event: MissionEventEntity = {
      event_id: randomUUID(),
      type: data.type,
      mission_id: data.mission_id,
      business_id: data.business_id,
      occurred_at: new Date(),
      payload: data.payload,
      verification: data.verification,
      reward: data.reward,
    };

    missions.set(event.event_id, event);

    return {
      event_id: event.event_id,
      type: event.type,
      mission_id: event.mission_id,
      business_id: event.business_id,
      occurred_at: event.occurred_at.toISOString(),
      payload: event.payload,
      verification: event.verification,
      reward: event.reward,
    };
  }

  /** Find by business */
  findByBusiness(businessId: string): MissionEvent[] {
    return Array.from(missions.values())
      .filter((m) => m.business_id === businessId)
      .map((m) => ({
        event_id: m.event_id,
        type: m.type,
        mission_id: m.mission_id,
        business_id: m.business_id,
        occurred_at: m.occurred_at.toISOString(),
        payload: m.payload,
        verification: m.verification,
        reward: m.reward,
      }));
  }

  /** Find by ID */
  findById(eventId: string): MissionEvent | undefined {
    const m = missions.get(eventId);
    if (!m) return undefined;
    return {
      event_id: m.event_id,
      type: m.type,
      mission_id: m.mission_id,
      business_id: m.business_id,
      occurred_at: m.occurred_at.toISOString(),
      payload: m.payload,
      verification: m.verification,
      reward: m.reward,
    };
  }
}

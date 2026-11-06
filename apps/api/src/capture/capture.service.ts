import { randomUUID } from 'node:crypto';
import type {
  CaptureEntity,
  CaptureType,
  CaptureStatus,
  Confidence,
} from './capture.entity';
import type { Confidence as ConfidenceType } from '@voltra/contracts';

/** In-memory capture store */
const captures = new Map<string, CaptureEntity>();

export class CaptureService {
  /** Clear store - for tests */
  clearAll(): void {
    captures.clear();
  }

  /** Create capture */
  create(
    businessId: string,
    type: CaptureType,
    fileRef: string,
  ): CaptureEntity {
    const capture: CaptureEntity = {
      capture_id: randomUUID(),
      business_id: businessId,
      type,
      file_ref: fileRef,
      result: null,
      confidence: null,
      status: 'pending',
      request_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    captures.set(capture.capture_id, capture);
    return capture;
  }

  /** Find by ID */
  findById(captureId: string): CaptureEntity | undefined {
    return captures.get(captureId);
  }

  /** Update capture */
  update(
    captureId: string,
    updates: {
      result?: Record<string, unknown>;
      confidence?: Confidence;
      status?: CaptureStatus;
      request_id?: string;
    },
  ): CaptureEntity | undefined {
    const capture = captures.get(captureId);
    if (!capture) return undefined;

    Object.assign(capture, { ...updates, updated_at: new Date() });
    return capture;
  }

  /** Find by business */
  findByBusiness(businessId: string): CaptureEntity[] {
    return Array.from(captures.values()).filter(
      (c) => c.business_id === businessId,
    );
  }
}

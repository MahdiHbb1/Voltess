import type { Capture as CaptureContract, CaptureType, CaptureStatus } from '@voltra/contracts';
import type { Confidence } from '@voltra/contracts';

/** Capture entity - DB model */
export interface CaptureEntity {
  capture_id: string;
  business_id: string;
  type: CaptureType;
  file_ref: string;
  result: Record<string, unknown> | null;
  confidence: Confidence | null;
  status: CaptureStatus;
  request_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Map entity to contract */
export function toCaptureContract(entity: CaptureEntity): CaptureContract {
  return {
    capture_id: entity.capture_id,
    business_id: entity.business_id,
    type: entity.type,
    file_ref: entity.file_ref,
    result: entity.result,
    confidence: entity.confidence,
    status: entity.status,
    request_id: entity.request_id,
    created_at: entity.created_at.toISOString(),
    updated_at: entity.updated_at.toISOString(),
  };
}

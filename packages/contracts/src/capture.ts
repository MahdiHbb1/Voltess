import type { Confidence } from './common';

/**
 * C1: Capture types untuk M1-M3
 * Owner: Mahdi
 * Sprint: S2
 */

export type CaptureType = 'label' | 'meter' | 'token';
export type CaptureStatus = 'queued' | 'pending' | 'verified' | 'rejected' | 'needs_retake';

/** Capture entity */
export interface Capture {
  /** Capture ID */
  capture_id: string;
  /** Business ID */
  business_id: string;
  /** Capture type */
  type: CaptureType;
  /** Image/audio reference */
  file_ref: string;
  /** OCR/STT result */
  result: Record<string, unknown> | null;
  /** AI confidence */
  confidence: Confidence | null;
  /** Status */
  status: CaptureStatus;
  /** AI request_id */
  request_id: string | null;
  /** Timestamp created */
  created_at: string;
  /** Timestamp updated */
  updated_at: string;
}

/** P2.1: Create capture request */
export interface CreateCaptureRequest {
  /** Business ID */
  business_id: string;
  /** Capture type */
  type: CaptureType;
  /** Base64 image data or file upload */
  image_data?: string;
  /** Audio reference for STT */
  audio_ref?: string;
}

/** P2.2: Verify capture (confirm OCR result) */
export interface VerifyCaptureRequest {
  /** Confirmed - true to verify, false to reject */
  confirmed: boolean;
  /** Optional edited fields */
  edits?: Record<string, unknown>;
}

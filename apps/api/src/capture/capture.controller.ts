import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Req,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CaptureService } from './capture.service';
import { BusinessService } from '../business/business.service';
import { MissionService } from '../mission/mission.service';
import { StorageService } from '../storage/storage.service';
import { QueueService } from '../queue/queue.service';
import { MeterValidationService } from './meter-validation.service';
import type { Job } from '../queue/queue.service';
import { toCaptureContract } from './capture.entity';
import type {
  CreateCaptureRequest,
  VerifyCaptureRequest,
  Capture as CaptureContract,
  CaptureType,
  OcrLabelResponse,
  OcrMeterResponse,
} from '@voltess/contracts';

interface AuthRequest extends Request {
  userId?: string;
  idempotencyKey?: string;
}

@Controller('captures')
export class CaptureController {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private readonly captureService: CaptureService,
    private readonly businessService: BusinessService,
    private readonly missionService: MissionService,
    private readonly storageService: StorageService,
    private readonly queueService: QueueService,
    private readonly meterValidation: MeterValidationService,
  ) {}

  /** P2.1: Create capture + upload file + queue OCR */
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }))
  async create(
    @Body() body: CreateCaptureRequest,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number },
    @Req() req: AuthRequest,
  ): Promise<CaptureContract & { job_id?: string }> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    // Check business ownership
    const business = this.businessService.findById(body.business_id);
    if (!business || business.user_id !== userId) {
      throw new ForbiddenException('Business not owned by user');
    }

    // Validate file upload
    if (!file) {
      throw new BadRequestException('File upload required');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new PayloadTooLargeException(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024} MB`);
    }

    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(`Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    // Idempotency check
    if (req.idempotencyKey) {
      const existing = this.captureService.findByIdempotencyKey(req.idempotencyKey);
      if (existing) {
        const job = this.queueService.getJob(existing.capture_id);
        return { ...toCaptureContract(existing), job_id: job?.id };
      }
    }

    // Upload to storage
    const storageKey = await this.storageService.upload(
      file.buffer,
      file.mimetype,
      body.business_id,
      body.type,
    );

    // Create capture
    const capture = this.captureService.create(
      body.business_id,
      body.type as CaptureType,
      storageKey,
      req.idempotencyKey,
    );

    // Queue OCR job
    let jobId: string | undefined;
    if (body.type === 'label') {
      const job = await this.queueService.add('ocr', 'ocr-label', {
        captureId: capture.capture_id,
        storageKey,
      });
      jobId = job.id;
    } else if (body.type === 'meter') {
      const job = await this.queueService.add('ocr', 'ocr-meter', {
        captureId: capture.capture_id,
        storageKey,
      });
      jobId = job.id;
    }

    return { ...toCaptureContract(capture), job_id: jobId };
  }

  /** P2.1b: Batch upload multiple captures */
  @Post('batch')
  @UseInterceptors(FilesInterceptor('files', 100, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }))
  async createBatch(
    @Body() body: { business_id: string; type: string },
    @UploadedFiles() files: Array<{ buffer: Buffer; mimetype: string; size: number }>,
    @Req() req: AuthRequest,
  ): Promise<Array<CaptureContract & { job_id?: string }>> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const business = this.businessService.findById(body.business_id);
    if (!business || business.user_id !== userId) {
      throw new ForbiddenException('Business not owned by user');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results: Array<CaptureContract & { job_id?: string }> = [];

    for (const file of files) {
      if (file.size > this.MAX_FILE_SIZE) {
        throw new PayloadTooLargeException(`File exceeds ${this.MAX_FILE_SIZE / 1024 / 1024} MB`);
      }

      if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
        throw new UnsupportedMediaTypeException(`Allowed: ${this.ALLOWED_TYPES.join(', ')}`);
      }

      const storageKey = await this.storageService.upload(
        file.buffer,
        file.mimetype,
        body.business_id,
        body.type as 'label' | 'meter_open' | 'meter_close' | 'token',
      );

      const capture = this.captureService.create(
        body.business_id,
        body.type as CaptureType,
        storageKey,
        req.idempotencyKey,
      );

      let jobId: string | undefined;
      if (body.type === 'label') {
        const job = await this.queueService.add('ocr', 'ocr-label', {
          captureId: capture.capture_id,
          storageKey,
        });
        jobId = job.id;
      }

      results.push({ ...toCaptureContract(capture), job_id: jobId });
    }

    return results;
  }

  /** M2: Pair meter readings and validate */
  @Post('meter-pair')
  async pairMeter(
    @Body() body: { business_id: string; open_capture_id: string; close_capture_id: string; window_days: number },
    @Req() req: AuthRequest,
  ): Promise<{ valid: boolean; reason?: string; needs_confirmation?: boolean; delta_kwh?: number; event_id?: string }> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const business = this.businessService.findById(body.business_id);
    if (!business || business.user_id !== userId) {
      throw new ForbiddenException('Business not owned by user');
    }

    const openCapture = this.captureService.findById(body.open_capture_id);
    const closeCapture = this.captureService.findById(body.close_capture_id);

    if (!openCapture || !closeCapture) {
      throw new NotFoundException('Capture not found');
    }

    if (openCapture.type !== 'meter' || closeCapture.type !== 'meter') {
      throw new BadRequestException('Both captures must be meter type');
    }

    if (!openCapture.result || !closeCapture.result) {
      throw new BadRequestException('Both captures must have OCR results');
    }

    // Validate pair
    const validation = this.meterValidation.validatePair({
      open_kwh: openCapture.result.kwh as number,
      close_kwh: closeCapture.result.kwh as number,
      open_hash: openCapture.file_ref, // ponytail: use actual image hash when storage ready
      close_hash: closeCapture.file_ref,
      window_days: body.window_days,
    });

    if (!validation.valid) {
      return validation;
    }

    // Check daily reward limit
    if (!this.meterValidation.canReceiveReward(body.business_id)) {
      return { valid: false, reason: 'Daily reward limit reached (3/day)' };
    }

    // Create M2 mission event
    const event = await this.missionService.createEvent({
      type: 'mission_completed',
      mission_id: 'M2',
      business_id: body.business_id,
      payload: {
        capture_id: closeCapture.capture_id,
        meter_kwh: validation.delta_kwh!,
        window: `${body.window_days} days`,
      },
      verification: {
        status: 'verified',
        reason: null,
        confidence: closeCapture.confidence || 'high',
      },
      reward: {
        points: 15,
        badge: null,
      },
    });

    this.meterValidation.incrementRewardCount(body.business_id);

    return { valid: true, delta_kwh: validation.delta_kwh, event_id: event.event_id };
  }

  /** P2.2: Verify capture - confirm and update appliance */
  @Post(':id/verify')
  async verify(
    @Param('id') captureId: string,
    @Body() body: VerifyCaptureRequest,
    @Req() req: AuthRequest,
  ): Promise<CaptureContract> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const capture = this.captureService.findById(captureId);
    if (!capture) throw new NotFoundException('Capture not found');

    // Check business ownership
    const business = this.businessService.findById(capture.business_id);
    if (!business || business.user_id !== userId) {
      throw new ForbiddenException('Business not owned by user');
    }

    // Verify status
    if (capture.status !== 'pending') {
      throw new BadRequestException('Capture not pending verification');
    }

    if (body.confirmed) {
      // Update capture to verified
      this.captureService.update(captureId, { status: 'verified' });

      // Add appliance to business profile (M1 label only)
      if (capture.type === 'label' && capture.result) {
        this.businessService.addAppliance(
          capture.business_id,
          {
            name: (body.edits?.name as string) || (capture.result.name as string),
            power_w: (body.edits?.power_w as number) || (capture.result.power_w as number),
            brand: (body.edits?.brand as string) || (capture.result.brand as string),
            source: 'label',
            verified: true,
            capture_id: captureId,
          },
        );

        // Create mission event
        await this.missionService.createEvent({
          type: 'mission_completed',
          mission_id: 'M1',
          business_id: capture.business_id,
          payload: {
            capture_id: captureId,
          },
          verification: {
            status: 'verified',
            reason: null,
            confidence: capture.confidence || 'high',
          },
          reward: {
            points: 10,
            badge: 'first_label',
          },
        });
      }
    } else {
      // Rejected
      this.captureService.update(captureId, { status: 'rejected' });
    }

    const updated = this.captureService.findById(captureId);
    if (!updated) throw new NotFoundException('Capture not found');

    return toCaptureContract(updated);
  }

  /** Get job status */
  @Get('jobs/:jobId')
  async getJobStatus(
    @Param('jobId') jobId: string,
    @Req() req: AuthRequest,
  ): Promise<Job> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const job = this.queueService.getJob(jobId);
    if (!job) throw new NotFoundException('Job not found');

    // Authz: check capture ownership via job data
    const captureId = (job.data as { captureId?: string }).captureId;
    if (captureId) {
      const capture = this.captureService.findById(captureId);
      if (!capture) throw new NotFoundException('Capture not found');

      const business = this.businessService.findById(capture.business_id);
      if (!business || business.user_id !== userId) {
        throw new ForbiddenException('Job not owned by user');
      }
    }

    return job;
  }

  /** Get capture by ID */
  @Get(':id')
  async findOne(
    @Param('id') captureId: string,
    @Req() req: AuthRequest,
  ): Promise<CaptureContract> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const capture = this.captureService.findById(captureId);
    if (!capture) throw new NotFoundException('Capture not found');

    const business = this.businessService.findById(capture.business_id);
    if (!business || business.user_id !== userId) {
      throw new ForbiddenException('Business not owned by user');
    }

    return toCaptureContract(capture);
  }

  /** Call AI Gateway /ai/ocr-label - stub inline OCR */
  private async callOcrLabel(_storageKey: string): Promise<OcrLabelResponse> {
    // ponytail: HTTP call AI Gateway when live, mock inline for now
    const mockResponse: OcrLabelResponse = {
      request_id: `req_${Date.now()}`,
      engine_version: '0.1.0',
      mode: 'mock',
      confidence: 'high',
      warnings: [],
      name: 'Kulkas 2 Pintu',
      power_w: 150,
      brand: 'Samsung',
      needs_retake: false,
    };
    return mockResponse;
  }

  /** Call AI Gateway /ai/ocr-meter - stub inline OCR */
  private async callOcrMeter(_storageKey: string): Promise<OcrMeterResponse> {
    // ponytail: HTTP call AI Gateway when live, mock inline for now
    const mockResponse: OcrMeterResponse = {
      request_id: `req_${Date.now()}`,
      engine_version: '0.1.0',
      mode: 'mock',
      confidence: 'high',
      warnings: [],
      kwh: 1250.5,
      unit: 'kWh',
      digits_confidence: [0.98, 0.97, 0.99, 0.96, 0.95],
      needs_retake: false,
    };
    return mockResponse;
  }

  /** Process OCR job - worker simulation */
  async processOcrJob(captureId: string, jobType: 'label' | 'meter'): Promise<void> {
    const capture = this.captureService.findById(captureId);
    if (!capture) throw new Error('Capture not found');

    if (jobType === 'label') {
      const ocrResult = await this.callOcrLabel(capture.file_ref);
      const needsRetake = ocrResult.needs_retake || ocrResult.confidence === 'low';

      this.captureService.update(captureId, {
        result: {
          name: ocrResult.name,
          power_w: ocrResult.power_w,
          brand: ocrResult.brand,
        },
        confidence: ocrResult.confidence,
        status: needsRetake ? 'needs_retake' : 'pending',
        request_id: ocrResult.request_id,
      });
    } else if (jobType === 'meter') {
      const ocrResult = await this.callOcrMeter(capture.file_ref);
      const needsRetake = ocrResult.needs_retake || ocrResult.confidence === 'low';

      this.captureService.update(captureId, {
        result: {
          kwh: ocrResult.kwh,
          unit: ocrResult.unit,
          digits_confidence: ocrResult.digits_confidence,
        },
        confidence: ocrResult.confidence,
        status: needsRetake ? 'needs_retake' : 'pending',
        request_id: ocrResult.request_id,
      });
    }
  }
}

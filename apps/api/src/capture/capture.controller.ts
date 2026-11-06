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
  UseInterceptors,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CaptureService } from './capture.service';
import { BusinessService } from '../business/business.service';
import { MissionService } from '../mission/mission.service';
import { StorageService } from '../storage/storage.service';
import { QueueService } from '../queue/queue.service';
import type { Job } from '../queue/queue.service';
import { toCaptureContract } from './capture.entity';
import type {
  CreateCaptureRequest,
  VerifyCaptureRequest,
  Capture as CaptureContract,
  OcrLabelResponse,
} from '@voltra/contracts';

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
  ) {}

  /** P2.1: Create capture + upload file + queue OCR */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
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
      body.type,
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
    }

    return { ...toCaptureContract(capture), job_id: jobId };
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
        const appliance = this.businessService.addAppliance(
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

  /** Process OCR job - worker simulation */
  async processOcrJob(captureId: string): Promise<void> {
    const capture = this.captureService.findById(captureId);
    if (!capture) throw new Error('Capture not found');

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
  }
}

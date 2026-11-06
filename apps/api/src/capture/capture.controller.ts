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
} from '@nestjs/common';
import type { Request } from 'express';
import { CaptureService } from './capture.service';
import { BusinessService } from '../business/business.service';
import { MissionService } from '../mission/mission.service';
import { toCaptureContract } from './capture.entity';
import type {
  CreateCaptureRequest,
  VerifyCaptureRequest,
  Capture as CaptureContract,
  OcrLabelResponse,
} from '@voltra/contracts';

interface AuthRequest extends Request {
  userId?: string;
}

@Controller('captures')
export class CaptureController {
  constructor(
    private readonly captureService: CaptureService,
    private readonly businessService: BusinessService,
    private readonly missionService: MissionService,
  ) {}

  /** P2.1: Create capture + call OCR */
  @Post()
  async create(
    @Body() body: CreateCaptureRequest,
    @Req() req: AuthRequest,
  ): Promise<CaptureContract> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    // Check business ownership
    const business = this.businessService.findById(body.business_id);
    if (!business || business.user_id !== userId) {
      throw new ForbiddenException('Business not owned by user');
    }

    // Validate request
    if (body.type === 'label' && !body.image_data) {
      throw new BadRequestException('image_data required for label capture');
    }

    // ponytail: store file_ref stub, add S3 upload when storage ready
    const fileRef = `stub://${body.type}/${Date.now()}.jpg`;

    // Create capture
    const capture = this.captureService.create(
      body.business_id,
      body.type,
      fileRef,
    );

    // Call AI Gateway for label OCR
    if (body.type === 'label') {
      const ocrResult = await this.callOcrLabel(fileRef);
      const needsRetake = ocrResult.needs_retake || ocrResult.confidence === 'low';

      this.captureService.update(capture.capture_id, {
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

    const updated = this.captureService.findById(capture.capture_id);
    if (!updated) throw new NotFoundException('Capture not found');

    return toCaptureContract(updated);
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

  /** Call AI Gateway /ai/ocr-label */
  private async callOcrLabel(fileRef: string): Promise<OcrLabelResponse> {
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
}

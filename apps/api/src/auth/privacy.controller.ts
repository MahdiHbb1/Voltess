import {
  Controller,
  Get,
  Delete,
  Req,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrivacyService } from './privacy.service';
import type { DataCategory, DeletionRequest } from './privacy.service';
import { AuthService } from './auth.service';
import { BusinessService } from '../business/business.service';
import { CaptureService } from '../capture/capture.service';
import { MissionService } from '../mission/mission.service';
import { EntitlementService } from '../entitlement/entitlement.service';
import { StorageService } from '../storage/storage.service';

interface AuthRequest extends Request {
  userId?: string;
}

@Controller('privacy')
export class PrivacyController {
  constructor(
    private readonly privacyService: PrivacyService,
    private readonly authService: AuthService,
    private readonly businessService: BusinessService,
    private readonly captureService: CaptureService,
    private readonly missionService: MissionService,
    private readonly entitlementService: EntitlementService,
    private readonly storageService: StorageService,
  ) {}

  /** GET /privacy/data - list data categories */
  @Get('data')
  async getDataCategories(@Req() req: AuthRequest): Promise<{ categories: DataCategory[] }> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const business = await this.businessService.getProfileByUser(userId);
    if (!business) {
      throw new NotFoundException('Business profile not found');
    }

    const categories = this.privacyService.getDataCategories(userId, business.business_id);
    return { categories };
  }

  /** DELETE /privacy/account - request account deletion */
  @Delete('account')
  async deleteAccount(@Req() req: AuthRequest): Promise<{ request_id: string; status: string }> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const business = await this.businessService.getProfileByUser(userId);
    if (!business) {
      throw new NotFoundException('Business profile not found');
    }

    // Create deletion request
    const deletionRequest = this.privacyService.createDeletionRequest(
      userId,
      business.business_id,
    );

    // Perform deletion (sync for now, async with queue later)
    try {
      // 1. Delete captures and storage files
      const captures = this.captureService.findByBusiness(business.business_id);
      for (const capture of captures) {
        // ponytail: delete storage file when S3 ready
        // this.storageService.delete(capture.file_ref);
      }

      // 2. Soft delete business profile (mark as deleted, keep for audit)
      // ponytail: add deleted_at field to BusinessProfile
      // await this.businessService.markDeleted(business.business_id);

      // 3. Anonymize or delete auth data
      // ponytail: keep phone hash for fraud prevention, remove PII
      // await this.authService.anonymizeUser(userId);

      // 4. Keep mission events for analytics (anonymized)
      // Already business_id scoped, no user_id

      // 5. Keep entitlement audit log (anonymized)
      // Already business_id scoped

      this.privacyService.markCompleted(deletionRequest.request_id);

      return {
        request_id: deletionRequest.request_id,
        status: 'completed',
      };
    } catch (error) {
      this.privacyService.markFailed(deletionRequest.request_id);
      throw new BadRequestException('Deletion failed: ' + (error as Error).message);
    }
  }

  /** GET /privacy/deletion/:requestId - check deletion status */
  @Get('deletion/:requestId')
  async getDeletionStatus(
    @Req() req: AuthRequest,
  ): Promise<DeletionRequest> {
    const userId = req.userId;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const requestId = (req as any).params.requestId;
    const deletionRequest = this.privacyService.getDeletionRequest(requestId);

    if (!deletionRequest) {
      throw new NotFoundException('Deletion request not found');
    }

    // Authz: only owner can check
    if (deletionRequest.user_id !== userId) {
      throw new ForbiddenException('Not authorized to view this deletion request');
    }

    return deletionRequest;
  }
}

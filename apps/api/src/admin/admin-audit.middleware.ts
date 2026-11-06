/**
 * Admin audit middleware - tracks funnel events for admin metrics
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AdminAuditMiddleware implements NestMiddleware {
  constructor(private readonly adminService: AdminService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const latency = Date.now() - start;

      // Track capture events
      if (req.path.includes('/capture') && req.method === 'POST') {
        this.adminService.trackEvent({
          event: 'capture_start',
          userId: (req as any).user?.id || 'anonymous',
          businessId: (req as any).user?.business_id || 'unknown',
          pipeline: this.inferPipeline(req.path),
          timestamp: new Date(),
        });

        if (res.statusCode < 300) {
          this.adminService.trackEvent({
            event: 'capture_success',
            userId: (req as any).user?.id || 'anonymous',
            businessId: (req as any).user?.business_id || 'unknown',
            pipeline: this.inferPipeline(req.path),
            timestamp: new Date(),
          });
        }
      }

      // Track OCR/AI events
      if (req.path.includes('/ai/') && res.statusCode < 300) {
        this.adminService.trackEvent({
          event: 'ocr_success',
          userId: (req as any).user?.id || 'anonymous',
          businessId: (req as any).user?.business_id || 'unknown',
          pipeline: this.inferPipeline(req.path),
          timestamp: new Date(),
        });
      }

      // ponytail: track cost from ai_usage table when DB ready
    });

    next();
  }

  private inferPipeline(path: string): 'ocr-meter' | 'ocr-label' | 'ocr-token' | 'stt' {
    if (path.includes('meter')) return 'ocr-meter';
    if (path.includes('label')) return 'ocr-label';
    if (path.includes('token')) return 'ocr-token';
    if (path.includes('stt') || path.includes('voice')) return 'stt';
    return 'ocr-meter';
  }
}

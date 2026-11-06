import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

interface IdempotentRequest extends Request {
  idempotencyKey?: string;
}

/** In-memory idempotency store */
const idempotencyStore = new Map<string, { status: number; body: unknown; timestamp: number }>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  use(req: IdempotentRequest, res: Response, next: NextFunction): void {
    const key = req.headers['idempotency-key'] as string | undefined;

    if (!key) {
      next();
      return;
    }

    // Validate key format
    if (typeof key !== 'string' || key.length < 10 || key.length > 128) {
      throw new BadRequestException('Invalid Idempotency-Key format');
    }

    req.idempotencyKey = key;

    // Check for cached response
    const cached = idempotencyStore.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < IDEMPOTENCY_TTL) {
        res.status(cached.status).json(cached.body);
        return;
      }
      // Expired, delete
      idempotencyStore.delete(key);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      if (req.idempotencyKey && res.statusCode >= 200 && res.statusCode < 300) {
        idempotencyStore.set(req.idempotencyKey, {
          status: res.statusCode,
          body,
          timestamp: Date.now(),
        });
      }
      return originalJson(body) as Response;
    };

    next();
  }

  /** Clear store - for tests */
  static clearAll(): void {
    idempotencyStore.clear();
  }
}

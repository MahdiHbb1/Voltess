import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDIT_KEY } from './audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Inject(Reflector) private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(AUDIT_KEY, context.getHandler());
    if (!action) return next.handle();

    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    const ip = req.ip;

    return next.handle().pipe(
      tap(() => {
        // ponytail: async DB write skipped, add when audit queries needed
        console.log(`[AUDIT] action=${action} user=${userId} ip=${ip}`);
      })
    );
  }
}

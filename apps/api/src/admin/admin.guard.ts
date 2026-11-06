import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // ponytail: check JWT role claim when auth ready
    const isAdmin = req.headers['x-admin-key'] === process.env.ADMIN_KEY;
    return isAdmin;
  }
}

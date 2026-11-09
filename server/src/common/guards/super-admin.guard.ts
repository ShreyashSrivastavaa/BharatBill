import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const DEFAULT_SUPER_ADMIN_EMAILS = [
  'shreyashsr2004@gmail.com',
  'princevij04@gmail.com',
];

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      throw new ForbiddenException('Access denied: Authentication required');
    }

    const envAdmins = this.configService
      .get<string>('SUPER_ADMIN_EMAILS', '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const allowedAdmins = envAdmins.length > 0 ? envAdmins : DEFAULT_SUPER_ADMIN_EMAILS;
    const email = user.email.toLowerCase().trim();
    const isSuperAdmin = allowedAdmins.includes(email);

    if (!isSuperAdmin) {
      throw new ForbiddenException(
        `Access denied: Super Admin panel is strictly restricted. '${email}' is not authorized.`,
      );
    }

    return true;
  }
}


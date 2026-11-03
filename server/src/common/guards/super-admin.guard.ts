import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export const SUPER_ADMIN_EMAILS = [
  'shreyashsr2004@gmail.com',
  'princevij04@gmail.com',
];

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      throw new ForbiddenException('Access denied: Authentication required');
    }

    const email = user.email.toLowerCase().trim();
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);

    if (!isSuperAdmin) {
      throw new ForbiddenException(
        `Access denied: Super Admin panel is strictly restricted. '${email}' is not authorized.`,
      );
    }

    return true;
  }
}


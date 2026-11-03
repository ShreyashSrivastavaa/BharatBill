import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Extract businessId from header or route parameters
    const headerBusinessId = request.headers['x-business-id'] as string;
    const paramBusinessId = request.params?.businessId as string;
    const businessId = headerBusinessId || paramBusinessId;

    if (!businessId) {
      throw new BadRequestException('Business context missing (provide x-business-id header or businessId parameter)');
    }

    // Verify user is an active member of this business
    const membership = await this.prisma.businessMember.findUnique({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId,
        },
      },
      include: {
        business: true,
      },
    });

    if (!membership || !membership.isActive) {
      throw new ForbiddenException('Access denied: You are not an active member of this business');
    }

    // Attach verified business context to request for decorators and services
    request.businessId = businessId;
    request.business = membership.business;
    request.businessRole = membership.role;

    return true;
  }
}


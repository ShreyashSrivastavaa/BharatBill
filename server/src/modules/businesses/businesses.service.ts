import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SubscriptionStatus, UserRole } from '@prisma/client';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBusinessDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Business
      const business = await tx.business.create({
        data: {
          name: dto.name,
          legalName: dto.legalName,
          gstin: dto.gstin?.toUpperCase(),
          pan: dto.pan?.toUpperCase(),
          type: dto.type,
          state: dto.state,
          stateCode: dto.stateCode,
          address: dto.address,
          city: dto.city,
          pincode: dto.pincode,
          phone: dto.phone,
          email: dto.email,
          financialYearStart: dto.financialYearStart ?? 4,
        },
      });

      // 2. Add creator as OWNER
      await tx.businessMember.create({
        data: {
          userId,
          businessId: business.id,
          role: UserRole.OWNER,
          joinedAt: new Date(),
        },
      });

      // 3. Find Starter plan or create fallback
      let starterPlan = await tx.plan.findUnique({
        where: { name: 'Starter' },
      });

      if (!starterPlan) {
        starterPlan = await tx.plan.create({
          data: {
            name: 'Starter',
            price: 99,
            features: [
              'GST Invoicing',
              'Up to 100 Products',
              'Up to 50 Invoices/month',
              '1 User',
              'Email Support',
            ],
            limits: { maxProducts: 100, maxInvoicesPerMonth: 50, maxUsers: 1 },
            sortOrder: 1,
          },
        });
      }

      // 4. Create 30-day Trial Subscription
      const now = new Date();
      const trialEnds = new Date(now);
      trialEnds.setDate(trialEnds.getDate() + 30);

      const subscription = await tx.subscription.create({
        data: {
          businessId: business.id,
          planId: starterPlan.id,
          status: SubscriptionStatus.TRIALING,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnds,
          trialEndsAt: trialEnds,
        },
        include: {
          plan: true,
        },
      });

      // 5. Create default product category
      await tx.productCategory.create({
        data: {
          businessId: business.id,
          name: 'General',
          description: 'Default product category',
        },
      });

      // 6. Record Audit Log
      await tx.auditLog.create({
        data: {
          businessId: business.id,
          userId,
          action: 'BUSINESS_CREATED',
          entity: 'Business',
          entityId: business.id,
          newValue: { name: business.name, state: business.state, gstin: business.gstin },
        },
      });

      return {
        ...business,
        subscription,
      };
    });
  }

  async getMyBusinesses(userId: string) {
    const memberships = await this.prisma.businessMember.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        business: {
          include: {
            subscriptions: {
              where: {
                status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
              },
              include: {
                plan: true,
              },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.business,
      role: m.role,
      activeSubscription: m.business.subscriptions[0] || null,
    }));
  }

  async getBusinessById(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async update(businessId: string, userId: string, dto: UpdateBusinessDto) {
    const existing = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!existing) {
      throw new NotFoundException('Business not found');
    }

    const updated = await this.prisma.business.update({
      where: { id: businessId },
      data: {
        ...dto,
        gstin: dto.gstin ? dto.gstin.toUpperCase() : undefined,
        pan: dto.pan ? dto.pan.toUpperCase() : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        businessId,
        userId,
        action: 'BUSINESS_UPDATED',
        entity: 'Business',
        entityId: businessId,
        oldValue: { name: existing.name, gstin: existing.gstin, state: existing.state },
        newValue: { name: updated.name, gstin: updated.gstin, state: updated.state },
      },
    });

    return updated;
  }
}

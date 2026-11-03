import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Platform-wide high level KPI metrics and summaries
   */
  async getPlatformStats() {
    const [
      totalUsers,
      totalBusinesses,
      totalInvoices,
      totalPurchases,
      totalPayments,
      finalizedInvoicesAgg,
      plansBreakdown,
      activeSubscriptionsCount,
      recentBusinesses,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.business.count(),
      this.prisma.invoice.count(),
      this.prisma.purchase.count(),
      this.prisma.payment.count(),
      this.prisma.invoice.aggregate({
        where: { status: InvoiceStatus.FINALIZED },
        _sum: {
          total: true,
          cgst: true,
          sgst: true,
          igst: true,
        },
      }),
      this.prisma.subscription.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.subscription.count({
        where: {
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
        },
      }),
      this.prisma.business.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            where: { role: 'OWNER' },
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
          subscriptions: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { plan: true },
          },
          _count: {
            select: { invoices: true, customers: true, products: true },
          },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isEmailVerified: true,
          createdAt: true,
          memberships: {
            include: { business: { select: { id: true, name: true } } },
          },
        },
      }),
    ]);

    const totalGrossRevenue = finalizedInvoicesAgg._sum.total?.toNumber() || 0;
    const totalGstCollected =
      (finalizedInvoicesAgg._sum.cgst?.toNumber() || 0) +
      (finalizedInvoicesAgg._sum.sgst?.toNumber() || 0) +
      (finalizedInvoicesAgg._sum.igst?.toNumber() || 0);

    return {
      kpis: {
        totalUsers,
        totalBusinesses,
        totalInvoices,
        totalPurchases,
        totalPayments,
        totalGrossRevenue,
        totalGstCollected,
        activeSubscriptionsCount,
      },
      plansBreakdown,
      recentBusinesses,
      recentUsers,
    };
  }

  /**
   * List all businesses (tenants) across the entire SaaS platform
   */
  async getAllBusinesses(page: number = 1, limit: number = 50, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, businesses] = await Promise.all([
      this.prisma.business.count({ where }),
      this.prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
          subscriptions: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { plan: true },
          },
          _count: {
            select: {
              invoices: true,
              purchases: true,
              customers: true,
              products: true,
              payments: true,
            },
          },
        },
      }),
    ]);

    return {
      items: businesses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List all users across the entire platform
   */
  async getAllUsers(page: number = 1, limit: number = 50, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          memberships: {
            include: {
              business: {
                select: { id: true, name: true, gstin: true, state: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      items: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List all subscriptions across all tenants
   */
  async getAllSubscriptions() {
    return this.prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            gstin: true,
            members: {
              where: { role: 'OWNER' },
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
    });
  }

  /**
   * Platform-wide invoices search & overview
   */
  async getAllInvoices(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [total, invoices] = await Promise.all([
      this.prisma.invoice.count(),
      this.prisma.invoice.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, state: true } },
          customer: { select: { id: true, name: true, gstin: true } },
        },
      }),
    ]);

    return {
      items: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}


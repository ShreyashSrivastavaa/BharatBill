import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCurrentSubscription(businessId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: {
        businessId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      throw new NotFoundException('No active subscription found');
    }

    return sub;
  }

  /**
   * Gateway Abstraction (Razorpay test mode)
   */
  async createCheckoutSession(businessId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');

    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID', 'rzp_test_mock_12345');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    const amountInPaise = plan.price.toNumber() * 100;

    let orderId = `order_${Date.now()}_${Math.random().toString(36).slice(-6)}`;

    // If genuine Razorpay credentials are provided, call Razorpay Orders API
    if (keySecret && keyId && !keyId.includes('mock')) {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${businessId.slice(-6)}_${Date.now().toString().slice(-6)}`,
            notes: {
              businessId,
              planId,
            },
          }),
        });

        if (res.ok) {
          const order = (await res.json()) as any;
          orderId = order.id;
        }
      } catch (err: any) {
        // Fall back gracefully in sandbox if network unavailable
      }
    }

    return {
      orderId,
      keyId,
      amount: amountInPaise,
      currency: 'INR',
      planName: plan.name,
      businessName: business.name,
    };
  }

  /**
   * Webhook Signature Verification and Subscription Upgrade.
   * Handles payment.captured and subscription transitions idempotently.
   */
  async handleWebhook(rawBody: string, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');

    if (!secret) {
      throw new BadRequestException('Razorpay webhook secret not configured');
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new BadRequestException('Invalid webhook JSON payload');
    }

    const event = payload.event;
    const notes = payload.payload?.payment?.entity?.notes || payload.payload?.order?.entity?.notes || {};
    const businessId = notes.businessId;
    const planId = notes.planId;

    if (event === 'payment.captured' || event === 'order.paid') {
      if (businessId && planId) {
        // Find existing subscription or create new one
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setFullYear(periodEnd.getFullYear() + 1); // 1-year validity

        await this.prisma.subscription.upsert({
          where: {
            id: `sub_${businessId}`,
          },
          update: {
            planId,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            razorpaySubId: payload.payload?.payment?.entity?.id || null,
          },
          create: {
            id: `sub_${businessId}`,
            businessId,
            planId,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            razorpaySubId: payload.payload?.payment?.entity?.id || null,
          },
        });
      }
    } else if (event === 'subscription.cancelled') {
      if (businessId) {
        await this.prisma.subscription.updateMany({
          where: { businessId },
          data: { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
        });
      }
    }

    return { status: 'processed', event };
  }
}


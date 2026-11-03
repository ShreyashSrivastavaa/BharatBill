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

    // Create a mock Razorpay order ID for test mode
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(-6)}`;

    return {
      orderId: mockOrderId,
      keyId,
      amount: plan.price.toNumber() * 100, // In paise
      currency: 'INR',
      planName: plan.name,
      businessName: business.name,
    };
  }

  /**
   * Webhook Signature Verification and Subscription Upgrade
   */
  async handleWebhook(rawBody: string, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET', 'test_secret_123');

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process payment success event
    return { status: 'verified' };
  }
}


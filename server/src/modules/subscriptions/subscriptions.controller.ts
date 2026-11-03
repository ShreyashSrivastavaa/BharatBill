import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Public()
  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @UseGuards(TenantGuard)
  @Get('current')
  async getCurrentSubscription(@CurrentBusiness() businessId: string) {
    return this.subscriptionsService.getCurrentSubscription(businessId);
  }

  @UseGuards(TenantGuard)
  @Post('checkout')
  async createCheckout(
    @CurrentBusiness() businessId: string,
    @Body('planId') planId: string,
  ) {
    return this.subscriptionsService.createCheckoutSession(businessId, planId);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.subscriptionsService.handleWebhook(JSON.stringify(body), signature || '');
  }
}


import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';

@Controller('payments')
@UseGuards(TenantGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async recordPayment(
    @CurrentBusiness() businessId: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.paymentsService.recordPayment(businessId, dto);
  }

  @Get()
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: PaginationDto,
  ) {
    return this.paymentsService.findAll(businessId, query);
  }
}

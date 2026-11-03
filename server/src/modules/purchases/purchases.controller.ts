import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';

@Controller('purchases')
@UseGuards(TenantGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  async create(
    @CurrentBusiness() businessId: string,
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.purchasesService.create(businessId, dto);
  }

  @Get()
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: PaginationDto,
  ) {
    return this.purchasesService.findAll(businessId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.purchasesService.findOne(businessId, id);
  }
}


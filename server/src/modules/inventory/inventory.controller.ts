import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService, AdjustStockDto } from './inventory.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(TenantGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  async getMovements(
    @CurrentBusiness() businessId: string,
    @Query('productId') productId?: string,
    @Query() query?: PaginationDto,
  ) {
    return this.inventoryService.getMovements(businessId, productId, query);
  }

  @Post('adjust')
  async adjustStock(
    @CurrentBusiness() businessId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.inventoryService.adjustStock(businessId, dto, user?.id);
  }
}


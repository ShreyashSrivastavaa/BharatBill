import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';

@Controller('suppliers')
@UseGuards(TenantGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  async create(
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(businessId, dto);
  }

  @Get()
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: QuerySupplierDto,
  ) {
    return this.suppliersService.findAll(businessId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.suppliersService.findOne(businessId, id);
  }

  @Patch(':id')
  async update(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(businessId, id, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.suppliersService.delete(businessId, id);
  }
}

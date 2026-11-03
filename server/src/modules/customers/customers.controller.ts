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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';

@Controller('customers')
@UseGuards(TenantGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(businessId, dto);
  }

  @Get()
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: QueryCustomerDto,
  ) {
    return this.customersService.findAll(businessId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.findOne(businessId, id);
  }

  @Patch(':id')
  async update(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(businessId, id, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.delete(businessId, id);
  }
}


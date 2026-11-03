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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';

@Controller('products')
@UseGuards(TenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(businessId, dto);
  }

  @Get()
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: QueryProductDto,
  ) {
    return this.productsService.findAll(businessId, query);
  }

  @Get('categories')
  async getCategories(@CurrentBusiness() businessId: string) {
    return this.productsService.getCategories(businessId);
  }

  @Post('categories')
  async createCategory(
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.productsService.createCategory(businessId, dto);
  }

  @Get(':id')
  async findOne(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(businessId, id);
  }

  @Patch(':id')
  async update(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(businessId, id, dto);
  }

  @Delete(':id')
  async archive(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.archive(businessId, id);
  }
}


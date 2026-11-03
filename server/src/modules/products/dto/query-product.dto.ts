import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ProductTab {
  ALL = 'all',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductTab)
  tab?: ProductTab = ProductTab.ALL;

  @IsOptional()
  @IsString()
  categoryId?: string;
}


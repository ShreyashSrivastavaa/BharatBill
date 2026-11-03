import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  hsn?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  unit?: string = 'PCS';

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Purchase price must be positive' })
  purchasePrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Selling price must be positive' })
  sellingPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'GST rate must be at least 0%' })
  gstRate: number = 18;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  openingStock?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number = 10;
}

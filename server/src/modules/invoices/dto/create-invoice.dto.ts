import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Product name or description is required' })
  productName: string;

  @IsOptional()
  @IsString()
  hsn?: string;

  @IsOptional()
  @IsString()
  unit?: string = 'PCS';

  @Type(() => Number)
  @IsNumber()
  @Min(0.001, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Rate must be positive' })
  rate: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number = 0;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  gstRate: number = 18;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  placeOfSupply?: string; // 2-digit state code (e.g. "27")

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}

export class CalculateTaxDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  placeOfSupply?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}

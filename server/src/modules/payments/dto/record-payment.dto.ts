import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentDirection } from '@prisma/client';

export class RecordPaymentDto {
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  purchaseId?: string;

  @IsEnum(PaymentDirection)
  direction: PaymentDirection;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Payment amount must be greater than 0' })
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  reference?: string; // UPI txn id, Cheque no., etc.

  @IsOptional()
  @IsString()
  notes?: string;
}


import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { BusinessType } from '@prisma/client';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty({ message: 'Business name is required' })
  name: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid Indian GSTIN format (e.g. 27AADCB2230M1Z2)',
  })
  gstin?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid Indian PAN format (e.g. AADCB2230M)',
  })
  pan?: string;

  @IsOptional()
  @IsEnum(BusinessType, { message: 'Invalid business type' })
  type?: BusinessType = BusinessType.PROPRIETORSHIP;

  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsString()
  @Matches(/^[0-9]{2}$/, { message: 'State code must be a 2-digit number (e.g. 27 for Maharashtra)' })
  stateCode: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, { message: 'Pincode must be 6 digits' })
  pincode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  financialYearStart?: number = 4; // Default April
}


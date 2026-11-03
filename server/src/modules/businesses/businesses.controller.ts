import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessesService.create(user.id, dto);
  }

  @Get('my')
  async getMyBusinesses(@CurrentUser() user: CurrentUserData) {
    return this.businessesService.getMyBusinesses(user.id);
  }

  @Get(':businessId')
  @UseGuards(TenantGuard)
  async getBusinessById(@Param('businessId') businessId: string) {
    return this.businessesService.getBusinessById(businessId);
  }

  @Patch(':businessId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async update(
    @Param('businessId') businessId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessesService.update(businessId, user.id, dto);
  }
}

import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(SuperAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Health / Permission Check for Super Admin UI
   */
  @Get('me')
  async verifyAdmin(@CurrentUser() user: CurrentUserData) {
    return {
      isSuperAdmin: true,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Global SaaS Metrics
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getPlatformStats();
  }

  /**
   * List all Businesses (Tenants)
   */
  @Get('businesses')
  async getBusinesses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllBusinesses(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      search,
    );
  }

  /**
   * List all Users
   */
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      search,
    );
  }

  /**
   * List all Subscriptions across tenants
   */
  @Get('subscriptions')
  async getSubscriptions() {
    return this.adminService.getAllSubscriptions();
  }

  /**
   * List all Invoices across tenants
   */
  @Get('invoices')
  async getInvoices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllInvoices(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}


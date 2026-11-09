import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, CalculateTaxDto } from './dto/create-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@Controller('invoices')
@UseGuards(TenantGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('preview-tax')
  async previewTax(
    @CurrentBusiness() businessId: string,
    @Body() dto: CalculateTaxDto,
  ) {
    return this.invoicesService.previewTax(businessId, dto);
  }

  @Post()
  async createDraft(
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.createDraft(businessId, dto);
  }

  @Post(':id/finalize')
  async finalize(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invoicesService.finalize(businessId, id, user?.id);
  }

  @Post(':id/cancel')
  async cancel(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invoicesService.cancel(businessId, id, user?.id);
  }

  @Get()
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query() query: QueryInvoiceDto,
  ) {
    return this.invoicesService.findAll(businessId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.findOne(businessId, id);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, invoiceNumber } = await this.invoicesService.generatePdf(businessId, id);
    const safeFilename = `${invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}


import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentBusiness } from '../../common/decorators/current-business.decorator';

@Controller('reports')
@UseGuards(TenantGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboard(
    @CurrentBusiness() businessId: string,
    @Query('period') period?: string,
  ) {
    return this.reportsService.getDashboardSummary(businessId, period);
  }

  @Get('gst')
  async getGstSummary(
    @CurrentBusiness() businessId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportsService.getGstSummary(businessId, fromDate, toDate);
  }

  @Get('export/sales')
  async exportSalesCsv(
    @CurrentBusiness() businessId: string,
    @Res() res: Response,
  ) {
    const invoices = await this.reportsService.getSalesData(businessId);

    const headers = [
      'Invoice No',
      'Date',
      'Customer',
      'GSTIN',
      'Taxable Amount (Rs)',
      'CGST (Rs)',
      'SGST (Rs)',
      'IGST (Rs)',
      'Total Amount (Rs)',
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.date.toISOString().slice(0, 10),
      `"${inv.snapshotCustomerName || inv.customer?.name || 'Walk-in'}"`,
      inv.snapshotCustomerGstin || 'Unregistered',
      inv.taxableAmount.toString(),
      inv.cgst.toString(),
      inv.sgst.toString(),
      inv.igst.toString(),
      inv.total.toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"');
    res.status(200).send(csvContent);
  }
}

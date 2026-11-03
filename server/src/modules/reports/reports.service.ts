import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, InvoiceStatus, PurchaseStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get Live Real-Time Dashboard Metrics computed entirely from PostgreSQL records
   */
  async getDashboardSummary(businessId: string, period: string = 'this-month') {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    let startDate = new Date(currentYear, currentMonth, 1);
    let endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    if (period === 'last-month') {
      startDate = new Date(currentYear, currentMonth - 1, 1);
      endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    } else if (period === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    }

    // Previous period for % calculation
    const prevStart = new Date(startDate);
    prevStart.setMonth(prevStart.getMonth() - 1);
    const prevEnd = new Date(startDate);
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

    // 1. Current Period Sales
    const [salesCurrent, salesPrev, purchasesCurrent, recentInvoices, allProducts, customersWithDue, suppliersWithDue] =
      await Promise.all([
        this.prisma.invoice.aggregate({
          where: {
            businessId,
            status: InvoiceStatus.FINALIZED,
            date: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
          _count: { id: true },
        }),
        this.prisma.invoice.aggregate({
          where: {
            businessId,
            status: InvoiceStatus.FINALIZED,
            date: { gte: prevStart, lte: prevEnd },
          },
          _sum: { total: true },
        }),
        this.prisma.purchase.aggregate({
          where: {
            businessId,
            status: PurchaseStatus.FINALIZED,
            date: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
          _count: { id: true },
        }),
        this.prisma.invoice.findMany({
          where: { businessId },
          include: {
            customer: { select: { name: true, city: true } },
          },
          orderBy: { date: 'desc' },
          take: 5,
        }),
        this.prisma.product.findMany({
          where: { businessId, isArchived: false },
          select: { id: true, name: true, sku: true, currentStock: true, lowStockThreshold: true, unit: true },
        }),
        // Receivables: all finalized invoices total - amountPaid
        this.prisma.invoice.findMany({
          where: { businessId, status: InvoiceStatus.FINALIZED },
          select: { total: true, amountPaid: true },
        }),
        // Payables: all finalized purchases total - amountPaid
        this.prisma.purchase.findMany({
          where: { businessId, status: PurchaseStatus.FINALIZED },
          select: { total: true, amountPaid: true },
        }),
      ]);

    const totalSalesNum = salesCurrent._sum.total?.toNumber() || 0;
    const prevSalesNum = salesPrev._sum.total?.toNumber() || 0;
    const salesChangePercent =
      prevSalesNum > 0 ? Number((((totalSalesNum - prevSalesNum) / prevSalesNum) * 100).toFixed(1)) : 0;

    const totalPurchasesNum = purchasesCurrent._sum.total?.toNumber() || 0;

    let receivables = 0;
    customersWithDue.forEach((inv) => {
      receivables += inv.total.sub(inv.amountPaid).toNumber();
    });

    let payables = 0;
    suppliersWithDue.forEach((pur) => {
      payables += pur.total.sub(pur.amountPaid).toNumber();
    });

    const lowStockItems = allProducts.filter((p) => {
      const stock = p.currentStock.toNumber();
      const thresh = p.lowStockThreshold.toNumber();
      return stock <= thresh;
    });

    return {
      kpis: {
        totalSales: totalSalesNum,
        salesCount: salesCurrent._count.id,
        salesChangePercent,
        totalPurchases: totalPurchasesNum,
        purchaseCount: purchasesCurrent._count.id,
        receivables: Math.max(0, receivables),
        payables: Math.max(0, payables),
        totalProducts: allProducts.length,
        lowStockCount: lowStockItems.length,
      },
      lowStockItems: lowStockItems.slice(0, 5),
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.snapshotCustomerName || inv.customer?.name || 'Walk-in Customer',
        city: inv.customer?.city || '',
        date: inv.date,
        total: inv.total.toNumber(),
        status: inv.status,
      })),
    };
  }

  /**
   * GST Tax Summary for Chartered Accountant review
   */
  async getGstSummary(businessId: string, fromDate?: string, toDate?: string) {
    const whereInvoice: Prisma.InvoiceWhereInput = {
      businessId,
      status: InvoiceStatus.FINALIZED,
      ...(fromDate || toDate
        ? {
            date: {
              ...(fromDate ? { gte: new Date(fromDate) } : {}),
              ...(toDate ? { lte: new Date(toDate) } : {}),
            },
          }
        : {}),
    };

    const wherePurchase: Prisma.PurchaseWhereInput = {
      businessId,
      status: PurchaseStatus.FINALIZED,
      ...(fromDate || toDate
        ? {
            date: {
              ...(fromDate ? { gte: new Date(fromDate) } : {}),
              ...(toDate ? { lte: new Date(toDate) } : {}),
            },
          }
        : {}),
    };

    const [outward, inward] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: whereInvoice,
        _sum: {
          taxableAmount: true,
          cgst: true,
          sgst: true,
          igst: true,
          total: true,
        },
      }),
      this.prisma.purchase.aggregate({
        where: wherePurchase,
        _sum: {
          taxableAmount: true,
          cgst: true,
          sgst: true,
          igst: true,
          total: true,
        },
      }),
    ]);

    const cgstOut = outward._sum.cgst?.toNumber() || 0;
    const sgstOut = outward._sum.sgst?.toNumber() || 0;
    const igstOut = outward._sum.igst?.toNumber() || 0;

    const cgstIn = inward._sum.cgst?.toNumber() || 0;
    const sgstIn = inward._sum.sgst?.toNumber() || 0;
    const igstIn = inward._sum.igst?.toNumber() || 0;

    return {
      outwardSupply: {
        taxableAmount: outward._sum.taxableAmount?.toNumber() || 0,
        cgst: cgstOut,
        sgst: sgstOut,
        igst: igstOut,
        totalTax: cgstOut + sgstOut + igstOut,
        totalInvoiceValue: outward._sum.total?.toNumber() || 0,
      },
      inputTaxCredit: {
        taxableAmount: inward._sum.taxableAmount?.toNumber() || 0,
        cgst: cgstIn,
        sgst: sgstIn,
        igst: igstIn,
        totalTax: cgstIn + sgstIn + igstIn,
        totalPurchaseValue: inward._sum.total?.toNumber() || 0,
      },
      netGstPayable: {
        cgst: Math.max(0, cgstOut - cgstIn),
        sgst: Math.max(0, sgstOut - sgstIn),
        igst: Math.max(0, igstOut - igstIn),
        total: Math.max(0, cgstOut + sgstOut + igstOut - (cgstIn + sgstIn + igstIn)),
      },
    };
  }

  /**
   * Detailed Sales List for Export
   */
  async getSalesData(businessId: string) {
    return this.prisma.invoice.findMany({
      where: { businessId, status: InvoiceStatus.FINALIZED },
      include: { customer: true },
      orderBy: { date: 'desc' },
    });
  }
}


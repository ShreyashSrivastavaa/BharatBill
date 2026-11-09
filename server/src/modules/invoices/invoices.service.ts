import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GstService } from '../../services/gst/gst.service';
import { PdfService } from '../../services/pdf/pdf.service';
import { CreateInvoiceDto, CalculateTaxDto } from './dto/create-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { Prisma, InvoiceStatus, StockMovementType } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gstService: GstService,
    private readonly pdfService: PdfService,
  ) {}

  /**
   * Helper to compute Indian Financial Year string (e.g. "2026-27")
   */
  getFinancialYear(date: Date = new Date(), startMonth: number = 4): string {
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();
    const fyStart = month >= startMonth ? year : year - 1;
    const nextYearShort = String(fyStart + 1).slice(-2);
    return `${fyStart}-${nextYearShort}`;
  }

  /**
   * Concurrency-safe sequential invoice number generator within a transaction.
   * Acquires a PostgreSQL transaction-level advisory xact lock per business and financial year
   * so concurrent requests serialize without gap or race collisions.
   */
  private async generateNextInvoiceNumber(
    tx: Prisma.TransactionClient,
    businessId: string,
    financialYear: string,
  ): Promise<string> {
    // Generate deterministic 32-bit integer keys from businessId and financialYear for advisory lock
    const lockKeyString = `${businessId}_${financialYear}`;
    let hash = 0;
    for (let i = 0; i < lockKeyString.length; i++) {
      hash = (Math.imul(31, hash) + lockKeyString.charCodeAt(i)) | 0;
    }

    // Acquire PostgreSQL transaction-level advisory lock (automatically releases at commit/rollback)
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(${hash})`;

    // Count existing finalized invoices in this FY
    const count = await tx.invoice.count({
      where: {
        businessId,
        financialYear,
        status: { in: [InvoiceStatus.FINALIZED, InvoiceStatus.CANCELLED] },
      },
    });

    const nextSeq = count + 1;
    const padded = String(nextSeq).padStart(6, '0');
    return `INV-${padded}`;
  }

  /**
   * Live Authoritative Tax Calculation preview
   */
  async previewTax(businessId: string, dto: CalculateTaxDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) throw new NotFoundException('Business not found');

    let placeOfSupply = dto.placeOfSupply;
    if (!placeOfSupply && dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      placeOfSupply = customer?.stateCode || business.stateCode;
    }

    const calc = this.gstService.calculateInvoice(
      business.stateCode,
      placeOfSupply || business.stateCode,
      dto.items,
    );

    return {
      placeOfSupply: placeOfSupply || business.stateCode,
      isInterState: calc.isInterState,
      items: calc.items.map((item, idx) => ({
        ...dto.items[idx],
        taxableAmount: item.taxableAmount.toNumber(),
        cgst: item.cgst.toNumber(),
        sgst: item.sgst.toNumber(),
        igst: item.igst.toNumber(),
        amount: item.amount.toNumber(),
      })),
      subtotal: calc.subtotal.toNumber(),
      discountAmount: calc.discountAmount.toNumber(),
      taxableAmount: calc.taxableAmount.toNumber(),
      cgst: calc.cgst.toNumber(),
      sgst: calc.sgst.toNumber(),
      igst: calc.igst.toNumber(),
      totalTax: calc.totalTax.toNumber(),
      roundOff: calc.roundOff.toNumber(),
      total: calc.total.toNumber(),
    };
  }

  /**
   * Create Draft Invoice
   */
  async createDraft(businessId: string, dto: CreateInvoiceDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('An invoice must contain at least one item');
    }

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    let placeOfSupply = dto.placeOfSupply;
    if (!placeOfSupply && dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      placeOfSupply = customer?.stateCode || business.stateCode;
    }

    const invoiceDate = dto.date ? new Date(dto.date) : new Date();
    const financialYear = this.getFinancialYear(invoiceDate, business.financialYearStart);

    const calc = this.gstService.calculateInvoice(
      business.stateCode,
      placeOfSupply || business.stateCode,
      dto.items,
    );

    return this.prisma.$transaction(async (tx) => {
      // Drafts get a temporary draft identifier
      const draftNumber = `DRAFT-${Date.now().toString().slice(-6)}`;

      const invoice = await tx.invoice.create({
        data: {
          businessId,
          customerId: dto.customerId || null,
          invoiceNumber: draftNumber,
          financialYear,
          date: invoiceDate,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          placeOfSupply: placeOfSupply || business.stateCode,
          status: InvoiceStatus.DRAFT,
          subtotal: new Prisma.Decimal(calc.subtotal.toString()),
          discountAmount: new Prisma.Decimal(calc.discountAmount.toString()),
          taxableAmount: new Prisma.Decimal(calc.taxableAmount.toString()),
          cgst: new Prisma.Decimal(calc.cgst.toString()),
          sgst: new Prisma.Decimal(calc.sgst.toString()),
          igst: new Prisma.Decimal(calc.igst.toString()),
          roundOff: new Prisma.Decimal(calc.roundOff.toString()),
          total: new Prisma.Decimal(calc.total.toString()),
          notes: dto.notes || null,
          terms: dto.terms || null,
          items: {
            create: dto.items.map((item, idx) => {
              const cItem = calc.items[idx];
              return {
                productId: item.productId || null,
                productName: item.productName,
                hsn: item.hsn || null,
                unit: item.unit || 'PCS',
                quantity: new Prisma.Decimal(item.quantity),
                rate: new Prisma.Decimal(item.rate),
                discount: new Prisma.Decimal(item.discount || 0),
                taxableAmount: new Prisma.Decimal(cItem.taxableAmount.toString()),
                gstRate: new Prisma.Decimal(item.gstRate),
                cgst: new Prisma.Decimal(cItem.cgst.toString()),
                sgst: new Prisma.Decimal(cItem.sgst.toString()),
                igst: new Prisma.Decimal(cItem.igst.toString()),
                amount: new Prisma.Decimal(cItem.amount.toString()),
                sortOrder: idx,
              };
            }),
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      return invoice;
    });
  }

  /**
   * Finalize Invoice: Snapshots all data, assigns final invoice number, deducts inventory
   */
  async finalize(businessId: string, invoiceId: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, businessId },
        include: {
          items: true,
          customer: true,
          business: true,
        },
      });

      if (!invoice) throw new NotFoundException('Invoice not found');
      if (invoice.status === InvoiceStatus.FINALIZED) {
        throw new BadRequestException('Invoice is already finalized and immutable');
      }
      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestException('Cannot finalize a cancelled invoice');
      }

      // Generate sequential invoice number
      const invoiceNumber = await this.generateNextInvoiceNumber(
        tx,
        businessId,
        invoice.financialYear,
      );

      // Snapshot customer and business fields
      const updated = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          invoiceNumber,
          status: InvoiceStatus.FINALIZED,
          snapshotBusinessName: invoice.business.name,
          snapshotBusinessGstin: invoice.business.gstin,
          snapshotBusinessAddress: invoice.business.address,
          snapshotBusinessState: invoice.business.state,
          snapshotBusinessStateCode: invoice.business.stateCode,
          snapshotCustomerName: invoice.customer?.name || null,
          snapshotCustomerGstin: invoice.customer?.gstin || null,
          snapshotCustomerAddress: invoice.customer?.billingAddress || null,
          snapshotCustomerState: invoice.customer?.state || null,
          snapshotCustomerStateCode: invoice.customer?.stateCode || null,
        },
        include: {
          items: true,
          customer: true,
        },
      });

      // Deduct inventory for all items linked to a product
      for (const item of invoice.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });

          await tx.stockMovement.create({
            data: {
              businessId,
              productId: item.productId,
              type: StockMovementType.OUT,
              quantity: item.quantity,
              reason: `Sales Invoice ${invoiceNumber}`,
              referenceType: 'INVOICE',
              referenceId: invoice.id,
            },
          });
        }
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          businessId,
          userId,
          action: 'INVOICE_FINALIZED',
          entity: 'Invoice',
          entityId: invoice.id,
          newValue: { invoiceNumber, total: invoice.total.toNumber() },
        },
      });

      return updated;
    });
  }

  /**
   * Cancel Invoice: Restores stock and marks as CANCELLED
   */
  async cancel(businessId: string, invoiceId: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, businessId },
        include: { items: true },
      });

      if (!invoice) throw new NotFoundException('Invoice not found');
      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestException('Invoice is already cancelled');
      }

      // If finalized, reverse inventory
      if (invoice.status === InvoiceStatus.FINALIZED) {
        for (const item of invoice.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: {
                  increment: item.quantity,
                },
              },
            });

            await tx.stockMovement.create({
              data: {
                businessId,
                productId: item.productId,
                type: StockMovementType.IN,
                quantity: item.quantity,
                reason: `Cancelled Invoice ${invoice.invoiceNumber}`,
                referenceType: 'INVOICE_CANCEL',
                referenceId: invoice.id,
              },
            });
          }
        }
      }

      const cancelled = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.CANCELLED },
      });

      await tx.auditLog.create({
        data: {
          businessId,
          userId,
          action: 'INVOICE_CANCELLED',
          entity: 'Invoice',
          entityId: invoice.id,
        },
      });

      return cancelled;
    });
  }

  /**
   * List Invoices with search and status tabs
   */
  async findAll(businessId: string, query: QueryInvoiceDto) {
    const { page = 1, limit = 10, search, status, customerId, financialYear } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      businessId,
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(financialYear ? { financialYear } : {}),
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search, mode: 'insensitive' } },
              { snapshotCustomerName: { contains: search, mode: 'insensitive' } },
              { customer: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, city: true, phone: true, gstin: true },
          },
          items: true,
          payments: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single invoice by ID with complete breakdown for printing
   */
  async findOne(businessId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, businessId },
      include: {
        customer: true,
        business: true,
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        payments: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    return invoice;
  }

  /**
   * Generate authoritative PDF buffer for download
   */
  async generatePdf(businessId: string, id: string): Promise<{ buffer: Buffer; invoiceNumber: string }> {
    const invoice = await this.findOne(businessId, id);
    const buffer = await this.pdfService.generateInvoicePdf(invoice);
    return {
      buffer,
      invoiceNumber: invoice.invoiceNumber || 'draft',
    };
  }
}


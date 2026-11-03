import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GstService } from '../../services/gst/gst.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Prisma, PurchaseStatus, StockMovementType } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gstService: GstService,
  ) {}

  private async generateNextPurchaseNumber(
    tx: Prisma.TransactionClient,
    businessId: string,
    financialYear: string,
  ): Promise<string> {
    const count = await tx.purchase.count({
      where: { businessId, financialYear },
    });
    const nextSeq = count + 1;
    return `PUR-${String(nextSeq).padStart(6, '0')}`;
  }

  async create(businessId: string, dto: CreatePurchaseDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('A purchase must contain at least one item');
    }

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    let supplierStateCode = business.stateCode;
    let supplierName: string | null = null;
    let supplierGstin: string | null = null;

    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: dto.supplierId },
      });
      if (supplier) {
        supplierStateCode = supplier.stateCode || business.stateCode;
        supplierName = supplier.name;
        supplierGstin = supplier.gstin;
      }
    }

    const purchaseDate = dto.date ? new Date(dto.date) : new Date();
    const month = purchaseDate.getMonth() + 1;
    const year = purchaseDate.getFullYear();
    const fyStart = month >= 4 ? year : year - 1;
    const financialYear = `${fyStart}-${String(fyStart + 1).slice(-2)}`;

    const calc = this.gstService.calculateInvoice(
      supplierStateCode,
      business.stateCode,
      dto.items,
    );

    return this.prisma.$transaction(async (tx) => {
      const purchaseNumber = await this.generateNextPurchaseNumber(
        tx,
        businessId,
        financialYear,
      );

      const purchase = await tx.purchase.create({
        data: {
          businessId,
          supplierId: dto.supplierId || null,
          purchaseNumber,
          financialYear,
          date: purchaseDate,
          status: PurchaseStatus.FINALIZED,
          invoiceRef: dto.invoiceRef || null,
          subtotal: new Prisma.Decimal(calc.subtotal.toString()),
          discountAmount: new Prisma.Decimal(calc.discountAmount.toString()),
          taxableAmount: new Prisma.Decimal(calc.taxableAmount.toString()),
          cgst: new Prisma.Decimal(calc.cgst.toString()),
          sgst: new Prisma.Decimal(calc.sgst.toString()),
          igst: new Prisma.Decimal(calc.igst.toString()),
          roundOff: new Prisma.Decimal(calc.roundOff.toString()),
          total: new Prisma.Decimal(calc.total.toString()),
          snapshotSupplierName: supplierName,
          snapshotSupplierGstin: supplierGstin,
          notes: dto.notes || null,
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
          supplier: true,
        },
      });

      // Auto Stock-In for products
      for (const item of dto.items) {
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
              quantity: new Prisma.Decimal(item.quantity),
              reason: `Purchase ${purchaseNumber}`,
              referenceType: 'PURCHASE',
              referenceId: purchase.id,
            },
          });
        }
      }

      return purchase;
    });
  }

  async findAll(businessId: string, query: PaginationDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseWhereInput = {
      businessId,
      ...(search
        ? {
            OR: [
              { purchaseNumber: { contains: search, mode: 'insensitive' } },
              { snapshotSupplierName: { contains: search, mode: 'insensitive' } },
              { invoiceRef: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          supplier: true,
          items: true,
          payments: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(businessId: string, id: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { id, businessId },
      include: {
        supplier: true,
        items: true,
        payments: true,
      },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Prisma, PaymentDirection } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordPayment(businessId: string, dto: RecordPaymentDto) {
    if (!dto.invoiceId && !dto.purchaseId) {
      throw new BadRequestException('A payment must be linked to an invoice or a purchase');
    }

    const paymentAmount = new Prisma.Decimal(dto.amount);
    const paymentDate = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.$transaction(async (tx) => {
      // 1. If invoice payment
      if (dto.invoiceId) {
        const invoice = await tx.invoice.findFirst({
          where: { id: dto.invoiceId, businessId },
        });
        if (!invoice) throw new NotFoundException('Invoice not found');

        const newAmountPaid = invoice.amountPaid.add(paymentAmount);

        await tx.invoice.update({
          where: { id: dto.invoiceId },
          data: { amountPaid: newAmountPaid },
        });
      }

      // 2. If purchase payment
      if (dto.purchaseId) {
        const purchase = await tx.purchase.findFirst({
          where: { id: dto.purchaseId, businessId },
        });
        if (!purchase) throw new NotFoundException('Purchase not found');

        const newAmountPaid = purchase.amountPaid.add(paymentAmount);

        await tx.purchase.update({
          where: { id: dto.purchaseId },
          data: { amountPaid: newAmountPaid },
        });
      }

      // 3. Create payment record
      const payment = await tx.payment.create({
        data: {
          businessId,
          invoiceId: dto.invoiceId || null,
          purchaseId: dto.purchaseId || null,
          direction: dto.direction,
          amount: paymentAmount,
          method: dto.method,
          date: paymentDate,
          reference: dto.reference?.trim() || null,
          notes: dto.notes?.trim() || null,
        },
        include: {
          invoice: {
            select: { id: true, invoiceNumber: true, snapshotCustomerName: true, total: true },
          },
          purchase: {
            select: { id: true, purchaseNumber: true, snapshotSupplierName: true, total: true },
          },
        },
      });

      return payment;
    });
  }

  async findAll(businessId: string, query: PaginationDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      businessId,
      ...(search
        ? {
            OR: [
              { reference: { contains: search, mode: 'insensitive' } },
              { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
              { purchase: { purchaseNumber: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          invoice: {
            select: { id: true, invoiceNumber: true, snapshotCustomerName: true, total: true },
          },
          purchase: {
            select: { id: true, purchaseNumber: true, snapshotSupplierName: true, total: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}


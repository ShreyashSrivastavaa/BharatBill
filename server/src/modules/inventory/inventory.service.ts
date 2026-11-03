import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Prisma, StockMovementType } from '@prisma/client';

export interface AdjustStockDto {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMovements(businessId: string, productId?: string, query?: PaginationDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {
      businessId,
      ...(productId ? { productId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true, unit: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async adjustStock(businessId: string, dto: AdjustStockDto, userId?: string) {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const qty = new Prisma.Decimal(dto.quantity);

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: dto.productId, businessId },
      });

      if (!product) throw new NotFoundException('Product not found');

      let newStock = product.currentStock;
      if (dto.type === StockMovementType.IN) {
        newStock = product.currentStock.add(qty);
      } else if (dto.type === StockMovementType.OUT) {
        newStock = product.currentStock.sub(qty);
      } else {
        // ADJUSTMENT (sets stock to the specified quantity)
        newStock = qty;
      }

      await tx.product.update({
        where: { id: dto.productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          businessId,
          productId: dto.productId,
          type: dto.type,
          quantity: qty,
          reason: dto.reason || 'Manual Adjustment',
          referenceType: 'MANUAL_ADJUSTMENT',
        },
        include: { product: true },
      });

      await tx.auditLog.create({
        data: {
          businessId,
          userId,
          action: 'STOCK_ADJUSTED',
          entity: 'Product',
          entityId: dto.productId,
          oldValue: { stock: product.currentStock.toNumber() },
          newValue: { stock: newStock.toNumber(), reason: dto.reason },
        },
      });

      return movement;
    });
  }
}


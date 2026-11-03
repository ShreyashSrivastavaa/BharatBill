import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryProductDto, ProductTab } from './dto/query-product.dto';
import { Prisma, StockMovementType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, dto: CreateProductDto) {
    if (dto.sku) {
      const existing = await this.prisma.product.findUnique({
        where: {
          businessId_sku: {
            businessId,
            sku: dto.sku,
          },
        },
      });
      if (existing) {
        throw new ConflictException(`A product with SKU "${dto.sku}" already exists`);
      }
    }

    const openingStock = dto.openingStock ?? 0;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          businessId,
          name: dto.name,
          sku: dto.sku || null,
          hsn: dto.hsn || null,
          categoryId: dto.categoryId || null,
          unit: dto.unit || 'PCS',
          purchasePrice: new Prisma.Decimal(dto.purchasePrice),
          sellingPrice: new Prisma.Decimal(dto.sellingPrice),
          gstRate: new Prisma.Decimal(dto.gstRate),
          currentStock: new Prisma.Decimal(openingStock),
          lowStockThreshold: new Prisma.Decimal(dto.lowStockThreshold ?? 10),
        },
        include: {
          category: true,
        },
      });

      if (openingStock > 0) {
        await tx.stockMovement.create({
          data: {
            businessId,
            productId: product.id,
            type: StockMovementType.IN,
            quantity: new Prisma.Decimal(openingStock),
            reason: 'Opening stock',
            referenceType: 'MANUAL_ADJUSTMENT',
            referenceId: product.id,
          },
        });
      }

      return product;
    });
  }

  async findAll(businessId: string, query: QueryProductDto) {
    const { page = 1, limit = 10, search, tab = ProductTab.ALL, categoryId } = query;
    const skip = (page - 1) * limit;

    const baseWhere: Prisma.ProductWhereInput = {
      businessId,
      isArchived: false,
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { hsn: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    let tabWhere: Prisma.ProductWhereInput = {};
    if (tab === ProductTab.OUT_OF_STOCK) {
      tabWhere = { currentStock: { lte: 0 } };
    }

    // Counts for tabs
    const [allCount, outOfStockCount, rawLowStock] = await Promise.all([
      this.prisma.product.count({
        where: { businessId, isArchived: false },
      }),
      this.prisma.product.count({
        where: { businessId, isArchived: false, currentStock: { lte: 0 } },
      }),
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "Product"
        WHERE "businessId" = ${businessId}
          AND "isArchived" = false
          AND "currentStock" > 0
          AND "currentStock" <= "lowStockThreshold"
      `,
    ]);

    const lowStockCount = Number(rawLowStock[0]?.count ?? 0);

    let where: Prisma.ProductWhereInput = { ...baseWhere, ...tabWhere };

    if (tab === ProductTab.LOW_STOCK) {
      // Find IDs for products where currentStock > 0 AND currentStock <= lowStockThreshold
      const lowStockIds = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Product"
        WHERE "businessId" = ${businessId}
          AND "isArchived" = false
          AND "currentStock" > 0
          AND "currentStock" <= "lowStockThreshold"
      `;
      where = {
        ...baseWhere,
        id: { in: lowStockIds.map((r) => r.id) },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts: {
        all: allCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
    };
  }

  async findOne(businessId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, businessId, isArchived: false },
      include: {
        category: true,
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(businessId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(businessId, id);

    if (dto.sku && dto.sku !== existing.sku) {
      const duplicateSku = await this.prisma.product.findUnique({
        where: {
          businessId_sku: {
            businessId,
            sku: dto.sku,
          },
        },
      });
      if (duplicateSku) {
        throw new ConflictException(`A product with SKU "${dto.sku}" already exists`);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        sku: dto.sku !== undefined ? dto.sku || null : undefined,
        hsn: dto.hsn !== undefined ? dto.hsn || null : undefined,
        categoryId: dto.categoryId !== undefined ? dto.categoryId || null : undefined,
        unit: dto.unit,
        purchasePrice: dto.purchasePrice !== undefined ? new Prisma.Decimal(dto.purchasePrice) : undefined,
        sellingPrice: dto.sellingPrice !== undefined ? new Prisma.Decimal(dto.sellingPrice) : undefined,
        gstRate: dto.gstRate !== undefined ? new Prisma.Decimal(dto.gstRate) : undefined,
        lowStockThreshold:
          dto.lowStockThreshold !== undefined ? new Prisma.Decimal(dto.lowStockThreshold) : undefined,
      },
      include: { category: true },
    });
  }

  async archive(businessId: string, id: string) {
    await this.findOne(businessId, id);
    return this.prisma.product.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async getCategories(businessId: string) {
    return this.prisma.productCategory.findMany({
      where: { businessId },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(businessId: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.productCategory.findUnique({
      where: {
        businessId_name: {
          businessId,
          name: dto.name.trim(),
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }

    return this.prisma.productCategory.create({
      data: {
        businessId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { Prisma, PurchaseStatus } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        businessId,
        name: dto.name.trim(),
        gstin: dto.gstin ? dto.gstin.trim().toUpperCase() : null,
        phone: dto.phone?.trim() || null,
        email: dto.email ? dto.email.trim().toLowerCase() : null,
        address: dto.address?.trim() || null,
        city: dto.city?.trim() || null,
        state: dto.state || null,
        stateCode: dto.stateCode || null,
        pincode: dto.pincode?.trim() || null,
      },
    });
  }

  async findAll(businessId: string, query: QuerySupplierDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {
      businessId,
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { gstin: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rawSuppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: {
          purchases: {
            where: { status: PurchaseStatus.FINALIZED },
            select: { total: true, amountPaid: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    const items = rawSuppliers.map((supp) => {
      let totalPurchases = new Prisma.Decimal(0);
      let totalPaid = new Prisma.Decimal(0);

      supp.purchases.forEach((p) => {
        totalPurchases = totalPurchases.add(p.total);
        totalPaid = totalPaid.add(p.amountPaid);
      });

      const payables = totalPurchases.sub(totalPaid);

      return {
        id: supp.id,
        name: supp.name,
        gstin: supp.gstin,
        phone: supp.phone,
        email: supp.email,
        city: supp.city,
        state: supp.state,
        stateCode: supp.stateCode,
        address: supp.address,
        totalPurchases: totalPurchases.toNumber(),
        totalPaid: totalPaid.toNumber(),
        payables: payables.toNumber(),
        createdAt: supp.createdAt,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(businessId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, businessId, isActive: true },
      include: {
        purchases: {
          where: { status: { in: [PurchaseStatus.FINALIZED, PurchaseStatus.DRAFT] } },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    let totalPurchases = new Prisma.Decimal(0);
    let totalPaid = new Prisma.Decimal(0);

    supplier.purchases.forEach((p) => {
      if (p.status === PurchaseStatus.FINALIZED) {
        totalPurchases = totalPurchases.add(p.total);
        totalPaid = totalPaid.add(p.amountPaid);
      }
    });

    const payables = totalPurchases.sub(totalPaid);

    return {
      ...supplier,
      totalPurchases: totalPurchases.toNumber(),
      totalPaid: totalPaid.toNumber(),
      payables: payables.toNumber(),
    };
  }

  async update(businessId: string, id: string, dto: UpdateSupplierDto) {
    await this.findOne(businessId, id);

    return this.prisma.supplier.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : undefined,
        gstin: dto.gstin !== undefined ? (dto.gstin ? dto.gstin.trim().toUpperCase() : null) : undefined,
        phone: dto.phone !== undefined ? (dto.phone ? dto.phone.trim() : null) : undefined,
        email: dto.email !== undefined ? (dto.email ? dto.email.trim().toLowerCase() : null) : undefined,
        address: dto.address !== undefined ? (dto.address ? dto.address.trim() : null) : undefined,
        city: dto.city !== undefined ? (dto.city ? dto.city.trim() : null) : undefined,
        state: dto.state !== undefined ? dto.state : undefined,
        stateCode: dto.stateCode !== undefined ? dto.stateCode : undefined,
        pincode: dto.pincode !== undefined ? (dto.pincode ? dto.pincode.trim() : null) : undefined,
      },
    });
  }

  async delete(businessId: string, id: string) {
    await this.findOne(businessId, id);
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}


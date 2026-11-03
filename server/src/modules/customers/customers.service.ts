import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { Prisma, InvoiceStatus } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        businessId,
        name: dto.name.trim(),
        gstin: dto.gstin ? dto.gstin.trim().toUpperCase() : null,
        phone: dto.phone?.trim() || null,
        email: dto.email ? dto.email.trim().toLowerCase() : null,
        billingAddress: dto.billingAddress?.trim() || null,
        city: dto.city?.trim() || null,
        state: dto.state || null,
        stateCode: dto.stateCode || null,
        pincode: dto.pincode?.trim() || null,
      },
    });
  }

  async findAll(businessId: string, query: QueryCustomerDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
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

    const [rawCustomers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          invoices: {
            where: { status: InvoiceStatus.FINALIZED },
            select: { total: true, amountPaid: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    const items = rawCustomers.map((cust) => {
      let totalSales = new Prisma.Decimal(0);
      let totalPaid = new Prisma.Decimal(0);

      cust.invoices.forEach((inv) => {
        totalSales = totalSales.add(inv.total);
        totalPaid = totalPaid.add(inv.amountPaid);
      });

      const outstanding = totalSales.sub(totalPaid);

      return {
        id: cust.id,
        name: cust.name,
        gstin: cust.gstin,
        phone: cust.phone,
        email: cust.email,
        city: cust.city,
        state: cust.state,
        stateCode: cust.stateCode,
        billingAddress: cust.billingAddress,
        totalSales: totalSales.toNumber(),
        totalPaid: totalPaid.toNumber(),
        outstanding: outstanding.toNumber(),
        createdAt: cust.createdAt,
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
    const customer = await this.prisma.customer.findFirst({
      where: { id, businessId, isActive: true },
      include: {
        invoices: {
          where: { status: { in: [InvoiceStatus.FINALIZED, InvoiceStatus.DRAFT] } },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let totalSales = new Prisma.Decimal(0);
    let totalPaid = new Prisma.Decimal(0);

    customer.invoices.forEach((inv) => {
      if (inv.status === InvoiceStatus.FINALIZED) {
        totalSales = totalSales.add(inv.total);
        totalPaid = totalPaid.add(inv.amountPaid);
      }
    });

    const outstanding = totalSales.sub(totalPaid);

    return {
      ...customer,
      totalSales: totalSales.toNumber(),
      totalPaid: totalPaid.toNumber(),
      outstanding: outstanding.toNumber(),
    };
  }

  async update(businessId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(businessId, id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : undefined,
        gstin: dto.gstin !== undefined ? (dto.gstin ? dto.gstin.trim().toUpperCase() : null) : undefined,
        phone: dto.phone !== undefined ? (dto.phone ? dto.phone.trim() : null) : undefined,
        email: dto.email !== undefined ? (dto.email ? dto.email.trim().toLowerCase() : null) : undefined,
        billingAddress: dto.billingAddress !== undefined ? (dto.billingAddress ? dto.billingAddress.trim() : null) : undefined,
        city: dto.city !== undefined ? (dto.city ? dto.city.trim() : null) : undefined,
        state: dto.state !== undefined ? dto.state : undefined,
        stateCode: dto.stateCode !== undefined ? dto.stateCode : undefined,
        pincode: dto.pincode !== undefined ? (dto.pincode ? dto.pincode.trim() : null) : undefined,
      },
    });
  }

  async delete(businessId: string, id: string) {
    await this.findOne(businessId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

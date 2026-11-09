import { describe, it, expect, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { InvoicesService } from '../src/modules/invoices/invoices.service';

describe('Multi-Tenant Isolation & IDOR Protection', () => {
  it('prevents tenant A from querying tenant B invoice by scoping Prisma where clause', async () => {
    const mockPrisma = {
      invoice: {
        findFirst: vi.fn().mockImplementation(({ where }: { where: { id: string; businessId: string } }) => {
          // Simulate database having an invoice for Tenant B ('tenant-b-biz'), but requested by Tenant A ('tenant-a-biz')
          if (where.id === 'inv-123' && where.businessId === 'tenant-b-biz') {
            return Promise.resolve({
              id: 'inv-123',
              businessId: 'tenant-b-biz',
              invoiceNumber: 'INV-000001',
            });
          }
          // Any mismatch returns null (as findFirst with businessId would)
          return Promise.resolve(null);
        }),
      },
    };

    const service = new InvoicesService(mockPrisma as any, {} as any, {} as any);

    // Tenant A attempts to access Tenant B's invoice
    await expect(service.findOne('tenant-a-biz', 'inv-123')).rejects.toThrow(NotFoundException);

    // Tenant B accesses their own invoice
    const result = await service.findOne('tenant-b-biz', 'inv-123');
    expect(result).toBeDefined();
    expect(result.id).toBe('inv-123');
    expect(result.businessId).toBe('tenant-b-biz');
  });

  it('protects PDF generation from cross-tenant IDOR access', async () => {
    const mockPrisma = {
      invoice: {
        findFirst: vi.fn().mockResolvedValue(null), // Tenant mismatch returns null
      },
    };
    const mockPdf = {
      generateInvoicePdf: vi.fn(),
    };

    const service = new InvoicesService(mockPrisma as any, {} as any, mockPdf as any);

    // Attempting to generate PDF for foreign businessId throws 404
    await expect(service.generatePdf('foreign-tenant-biz', 'inv-secret')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPdf.generateInvoicePdf).not.toHaveBeenCalled();
  });
});

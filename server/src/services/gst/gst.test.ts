import { describe, it, expect } from 'vitest';
import { GstService } from './gst.service';

describe('GstService - Authoritative Indian GST Calculation Engine', () => {
  const service = new GstService();

  describe('Place of Supply & Tax Classification (Intra-State vs Inter-State)', () => {
    it('correctly classifies intra-state when supplier and customer are in same state code', () => {
      expect(service.isInterState('27', '27')).toBe(false);
      expect(service.isInterState('07', '07')).toBe(false);
      expect(service.isInterState('33', '33')).toBe(false);
    });

    it('correctly classifies inter-state when supplier and customer state codes differ', () => {
      expect(service.isInterState('27', '24')).toBe(true);
      expect(service.isInterState('07', '09')).toBe(true);
      expect(service.isInterState('29', '32')).toBe(true);
    });

    it('defaults to intra-state if either state code is missing or undefined', () => {
      expect(service.isInterState(null, '27')).toBe(false);
      expect(service.isInterState('27', undefined)).toBe(false);
      expect(service.isInterState('', '')).toBe(false);
    });
  });

  describe('Standard Indian GST Tax Slabs (Intra-State)', () => {
    it('calculates 0% (Nil-rated / Exempt) supplies accurately', () => {
      const res = service.calculateInvoice('27', '27', [
        { quantity: 5, rate: 200, discount: 0, gstRate: 0 },
      ]);
      expect(res.isInterState).toBe(false);
      expect(res.taxableAmount.toString()).toBe('1000');
      expect(res.cgst.toString()).toBe('0');
      expect(res.sgst.toString()).toBe('0');
      expect(res.igst.toString()).toBe('0');
      expect(res.total.toString()).toBe('1000');
      expect(res.roundOff.toString()).toBe('0');
    });

    it('calculates 5% slab split equally into 2.5% CGST + 2.5% SGST', () => {
      const res = service.calculateInvoice('27', '27', [
        { quantity: 2, rate: 500, discount: 0, gstRate: 5 },
      ]);
      expect(res.taxableAmount.toString()).toBe('1000');
      expect(res.cgst.toString()).toBe('25');
      expect(res.sgst.toString()).toBe('25');
      expect(res.igst.toString()).toBe('0');
      expect(res.total.toString()).toBe('1050');
    });

    it('calculates 12% slab split equally into 6% CGST + 6% SGST', () => {
      const res = service.calculateInvoice('27', '27', [
        { quantity: 1, rate: 1250, discount: 50, gstRate: 12 },
      ]);
      // (1250 - 50) = 1200 taxable @ 12% = 144 tax (72 + 72)
      expect(res.taxableAmount.toString()).toBe('1200');
      expect(res.cgst.toString()).toBe('72');
      expect(res.sgst.toString()).toBe('72');
      expect(res.total.toString()).toBe('1344');
    });

    it('calculates 18% slab split equally into 9% CGST + 9% SGST', () => {
      const res = service.calculateInvoice('27', '27', [
        { quantity: 1, rate: 10000, discount: 0, gstRate: 18 },
      ]);
      expect(res.taxableAmount.toString()).toBe('10000');
      expect(res.cgst.toString()).toBe('900');
      expect(res.sgst.toString()).toBe('900');
      expect(res.igst.toString()).toBe('0');
      expect(res.total.toString()).toBe('11800');
    });

    it('calculates 28% luxury/demerit slab split into 14% CGST + 14% SGST', () => {
      const res = service.calculateInvoice('07', '07', [
        { quantity: 1, rate: 50000, discount: 0, gstRate: 28 },
      ]);
      expect(res.taxableAmount.toString()).toBe('50000');
      expect(res.cgst.toString()).toBe('7000');
      expect(res.sgst.toString()).toBe('7000');
      expect(res.total.toString()).toBe('64000');
    });
  });

  describe('Inter-State IGST Calculations', () => {
    it('applies entire tax as IGST with 0 CGST and 0 SGST', () => {
      const res = service.calculateInvoice('27', '24', [
        { quantity: 2, rate: 5000, discount: 1000, gstRate: 18 },
      ]);
      // line total: 10000 - 1000 discount = 9000 taxable @ 18% = 1620 IGST
      expect(res.isInterState).toBe(true);
      expect(res.taxableAmount.toString()).toBe('9000');
      expect(res.cgst.toString()).toBe('0');
      expect(res.sgst.toString()).toBe('0');
      expect(res.igst.toString()).toBe('1620');
      expect(res.total.toString()).toBe('10620');
    });
  });

  describe('Rounding & Decimal Protection', () => {
    it('correctly computes standard Indian 50-paise round-off adjustments', () => {
      const res = service.calculateInvoice('27', '27', [
        { quantity: 3, rate: 33.33, discount: 0, gstRate: 18 },
      ]);
      expect(res.total.toString()).toBe('118');
      expect(res.roundOff.toString()).toBe('0.01');
    });
  });
});

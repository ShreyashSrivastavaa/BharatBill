import { describe, it, expect } from 'vitest';
import { GstService } from './gst.service';

describe('GstService', () => {
  const service = new GstService();

  it('calculates intra-state 18% tax accurately (₹10,000 = ₹900 CGST + ₹900 SGST = ₹11,800)', () => {
    const res = service.calculateInvoice('27', '27', [
      { quantity: 1, rate: 10000, discount: 0, gstRate: 18 },
    ]);

    expect(res.isInterState).toBe(false);
    expect(res.taxableAmount.toString()).toBe('10000');
    expect(res.cgst.toString()).toBe('900');
    expect(res.sgst.toString()).toBe('900');
    expect(res.igst.toString()).toBe('0');
    expect(res.total.toString()).toBe('11800');
    expect(res.roundOff.toString()).toBe('0');
  });

  it('calculates inter-state 18% tax accurately (Maharashtra 27 to Gujarat 24 = ₹1,800 IGST)', () => {
    const res = service.calculateInvoice('27', '24', [
      { quantity: 1, rate: 10000, discount: 0, gstRate: 18 },
    ]);

    expect(res.isInterState).toBe(true);
    expect(res.cgst.toString()).toBe('0');
    expect(res.sgst.toString()).toBe('0');
    expect(res.igst.toString()).toBe('1800');
    expect(res.total.toString()).toBe('11800');
  });

  it('handles item discounts, multi-rate items and round-off', () => {
    const res = service.calculateInvoice('27', '27', [
      { quantity: 2, rate: 155.50, discount: 11, gstRate: 12 }, // (311 - 11) = 300 @ 12% = 36 tax (18 CGST, 18 SGST) = 336
      { quantity: 1, rate: 50.25, discount: 0, gstRate: 5 },    // 50.25 @ 5% = 2.51 tax (1.26 CGST, 1.26 SGST) = 52.76
    ]);

    expect(res.taxableAmount.toString()).toBe('350.25');
    // raw total = 350.25 + 36 + 2.52 = 388.77
    // rounded total = 389, roundOff = +0.23
    expect(res.total.toString()).toBe('389');
    expect(res.roundOff.toString()).toBe('0.23');
  });
});

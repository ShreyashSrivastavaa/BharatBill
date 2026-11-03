import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

export interface GstItemInput {
  quantity: number | string | Decimal;
  rate: number | string | Decimal;
  discount?: number | string | Decimal;
  gstRate: number | string | Decimal;
}

export interface CalculatedGstItem {
  quantity: Decimal;
  rate: Decimal;
  discount: Decimal;
  taxableAmount: Decimal;
  gstRate: Decimal;
  cgst: Decimal;
  sgst: Decimal;
  igst: Decimal;
  amount: Decimal; // taxableAmount + tax
}

export interface GstCalculationResult {
  isInterState: boolean;
  items: CalculatedGstItem[];
  subtotal: Decimal;
  discountAmount: Decimal;
  taxableAmount: Decimal;
  cgst: Decimal;
  sgst: Decimal;
  igst: Decimal;
  totalTax: Decimal;
  roundOff: Decimal;
  total: Decimal;
}

@Injectable()
export class GstService {
  /**
   * Determine if transaction is inter-state based on state codes (e.g. "27" for Maharashtra)
   */
  isInterState(supplierStateCode?: string | null, placeOfSupplyStateCode?: string | null): boolean {
    if (!supplierStateCode || !placeOfSupplyStateCode) {
      return false; // Default to intra-state if either state code is missing
    }
    return supplierStateCode.trim() !== placeOfSupplyStateCode.trim();
  }

  /**
   * Calculate line item tax and totals using Decimal.js to prevent JS floating-point issues
   */
  calculateInvoice(
    supplierStateCode: string | null | undefined,
    placeOfSupplyStateCode: string | null | undefined,
    items: GstItemInput[],
  ): GstCalculationResult {
    const isInterState = this.isInterState(supplierStateCode, placeOfSupplyStateCode);

    let totalSubtotal = new Decimal(0);
    let totalDiscount = new Decimal(0);
    let totalTaxable = new Decimal(0);
    let totalCgst = new Decimal(0);
    let totalSgst = new Decimal(0);
    let totalIgst = new Decimal(0);

    const calculatedItems: CalculatedGstItem[] = items.map((item) => {
      const qty = new Decimal(item.quantity || 0);
      const rate = new Decimal(item.rate || 0);
      const discount = new Decimal(item.discount || 0);
      const gstRate = new Decimal(item.gstRate || 0);

      const lineTotal = qty.times(rate);
      // Taxable amount is line total minus discount (min 0)
      const taxable = Decimal.max(0, lineTotal.minus(discount)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      let cgst = new Decimal(0);
      let sgst = new Decimal(0);
      let igst = new Decimal(0);

      if (gstRate.greaterThan(0)) {
        if (isInterState) {
          // Full tax goes to IGST
          igst = taxable.times(gstRate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        } else {
          // Half to CGST, half to SGST
          const halfRate = gstRate.dividedBy(2);
          cgst = taxable.times(halfRate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
          sgst = taxable.times(halfRate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        }
      }

      const itemTax = cgst.plus(sgst).plus(igst);
      const amount = taxable.plus(itemTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      totalSubtotal = totalSubtotal.plus(lineTotal);
      totalDiscount = totalDiscount.plus(discount);
      totalTaxable = totalTaxable.plus(taxable);
      totalCgst = totalCgst.plus(cgst);
      totalSgst = totalSgst.plus(sgst);
      totalIgst = totalIgst.plus(igst);

      return {
        quantity: qty,
        rate,
        discount,
        taxableAmount: taxable,
        gstRate,
        cgst,
        sgst,
        igst,
        amount,
      };
    });

    const totalTax = totalCgst.plus(totalSgst).plus(totalIgst);
    const rawTotal = totalTaxable.plus(totalTax);

    // Standard Indian Round-off to nearest rupee
    const roundedTotal = rawTotal.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
    const roundOff = roundedTotal.minus(rawTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
      isInterState,
      items: calculatedItems,
      subtotal: totalSubtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      discountAmount: totalDiscount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      taxableAmount: totalTaxable.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      cgst: totalCgst.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      sgst: totalSgst.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      igst: totalIgst.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      totalTax: totalTax.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      roundOff,
      total: roundedTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    };
  }
}

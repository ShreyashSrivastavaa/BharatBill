/* ──────────────────────────────────────────────────────────────────────────────
 *  Indian-locale formatting helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Format a number as Indian Rupees with proper grouping.
 * e.g. 1248500 → ₹12,48,500.00
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return currencyFormatter.format(num);
}

/**
 * Format a number with Indian grouping (no currency symbol).
 * e.g. 1248500 → 12,48,500
 */
export function formatNumber(n: number): string {
  if (isNaN(n)) return '0';
  return numberFormatter.format(n);
}

/**
 * Format a date as DD Mon YYYY.
 * e.g. "2026-11-03" → "03 Nov 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date as DD Mon YYYY, HH:MM AM/PM.
 * e.g. "2026-11-03T14:30:00Z" → "03 Nov 2026, 02:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Return a structured GSTIN display object.
 * GSTIN format: 22AAAAA0000A1Z5
 *   - first 2 digits = state code
 *   - next 10 = PAN
 *   - 13th = entity number
 *   - 14th = Z (default)
 *   - 15th = check digit
 */
export function formatGSTIN(gstin: string): { stateCode: string; rest: string; full: string } {
  const cleaned = gstin.replace(/\s/g, '').toUpperCase();
  return {
    stateCode: cleaned.slice(0, 2),
    rest: cleaned.slice(2),
    full: cleaned,
  };
}

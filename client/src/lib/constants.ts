/* ──────────────────────────────────────────────────────────────────────────────
 *  Application-wide constants
 * ──────────────────────────────────────────────────────────────────────────── */

import type { BusinessType, PaymentMethod } from '@/types';

// ─── Indian States & Union Territories ──────────────────────────────────────

export const INDIAN_STATES: ReadonlyArray<{
  name: string;
  code: string;
  gstCode: string;
}> = [
  // States
  { name: 'Andhra Pradesh', code: 'AP', gstCode: '37' },
  { name: 'Arunachal Pradesh', code: 'AR', gstCode: '12' },
  { name: 'Assam', code: 'AS', gstCode: '18' },
  { name: 'Bihar', code: 'BR', gstCode: '10' },
  { name: 'Chhattisgarh', code: 'CG', gstCode: '22' },
  { name: 'Goa', code: 'GA', gstCode: '30' },
  { name: 'Gujarat', code: 'GJ', gstCode: '24' },
  { name: 'Haryana', code: 'HR', gstCode: '06' },
  { name: 'Himachal Pradesh', code: 'HP', gstCode: '02' },
  { name: 'Jharkhand', code: 'JH', gstCode: '20' },
  { name: 'Karnataka', code: 'KA', gstCode: '29' },
  { name: 'Kerala', code: 'KL', gstCode: '32' },
  { name: 'Madhya Pradesh', code: 'MP', gstCode: '23' },
  { name: 'Maharashtra', code: 'MH', gstCode: '27' },
  { name: 'Manipur', code: 'MN', gstCode: '14' },
  { name: 'Meghalaya', code: 'ML', gstCode: '17' },
  { name: 'Mizoram', code: 'MZ', gstCode: '15' },
  { name: 'Nagaland', code: 'NL', gstCode: '13' },
  { name: 'Odisha', code: 'OD', gstCode: '21' },
  { name: 'Punjab', code: 'PB', gstCode: '03' },
  { name: 'Rajasthan', code: 'RJ', gstCode: '08' },
  { name: 'Sikkim', code: 'SK', gstCode: '11' },
  { name: 'Tamil Nadu', code: 'TN', gstCode: '33' },
  { name: 'Telangana', code: 'TG', gstCode: '36' },
  { name: 'Tripura', code: 'TR', gstCode: '16' },
  { name: 'Uttar Pradesh', code: 'UP', gstCode: '09' },
  { name: 'Uttarakhand', code: 'UK', gstCode: '05' },
  { name: 'West Bengal', code: 'WB', gstCode: '19' },

  // Union Territories
  { name: 'Andaman and Nicobar Islands', code: 'AN', gstCode: '35' },
  { name: 'Chandigarh', code: 'CH', gstCode: '04' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DD', gstCode: '26' },
  { name: 'Delhi', code: 'DL', gstCode: '07' },
  { name: 'Jammu and Kashmir', code: 'JK', gstCode: '01' },
  { name: 'Ladakh', code: 'LA', gstCode: '38' },
  { name: 'Lakshadweep', code: 'LD', gstCode: '31' },
  { name: 'Puducherry', code: 'PY', gstCode: '34' },
] as const;

// ─── GST ─────────────────────────────────────────────────────────────────────

export const GST_RATES: readonly number[] = [0, 5, 12, 18, 28] as const;

// ─── Product units ───────────────────────────────────────────────────────────

export const PRODUCT_UNITS: readonly string[] = [
  'PCS',
  'KG',
  'GM',
  'LTR',
  'ML',
  'MTR',
  'CM',
  'BOX',
  'PACK',
  'PAIR',
  'SET',
  'SQM',
  'SQFT',
  'NOS',
] as const;

// ─── Business types ─────────────────────────────────────────────────────────

export const BUSINESS_TYPES: ReadonlyArray<{
  value: BusinessType;
  label: string;
}> = [
  { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'LLP', label: 'Limited Liability Partnership (LLP)' },
  { value: 'PRIVATE_LIMITED', label: 'Private Limited Company' },
  { value: 'PUBLIC_LIMITED', label: 'Public Limited Company' },
  { value: 'HUF', label: 'Hindu Undivided Family (HUF)' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'SOCIETY', label: 'Society' },
  { value: 'OTHER', label: 'Other' },
] as const;

// ─── Payment methods ─────────────────────────────────────────────────────────

export const PAYMENT_METHODS: ReadonlyArray<{
  value: PaymentMethod;
  label: string;
}> = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS/IMPS)' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'NET_BANKING', label: 'Net Banking' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'OTHER', label: 'Other' },
] as const;

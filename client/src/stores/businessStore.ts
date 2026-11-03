import { create } from 'zustand';
import type { Business } from '@/types';

/**
 * Compute the current Indian financial year string.
 * Indian FY runs April 1 → March 31.
 * e.g. if today is Nov 2026, FY = "2026-2027".
 *      if today is Feb 2027, FY = "2026-2027".
 */
function getCurrentFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed: 0=Jan, 3=Apr
  const year = now.getFullYear();
  const fyStart = month >= 3 ? year : year - 1; // April onwards = current year, before April = previous year
  return `${fyStart}-${fyStart + 1}`;
}

interface BusinessState {
  currentBusiness: Business | null;
  businesses: Business[];
  financialYear: string;
  setCurrentBusiness: (business: Business | null) => void;
  setBusinesses: (businesses: Business[]) => void;
  setFinancialYear: (fy: string) => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  currentBusiness: null,
  businesses: [],
  financialYear: getCurrentFinancialYear(),

  setCurrentBusiness: (currentBusiness) => set({ currentBusiness }),
  setBusinesses: (businesses) => set({ businesses }),
  setFinancialYear: (financialYear) => set({ financialYear }),
}));

/* ──────────────────────────────────────────────────────────────────────────────
 *  BharatBill — Shared TypeScript types
 * ──────────────────────────────────────────────────────────────────────────── */

// ─── Enums / union types ─────────────────────────────────────────────────────

export type BusinessType =
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'LLP'
  | 'PRIVATE_LIMITED'
  | 'PUBLIC_LIMITED'
  | 'HUF'
  | 'TRUST'
  | 'SOCIETY'
  | 'OTHER';

export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type PurchaseStatus =
  | 'DRAFT'
  | 'RECEIVED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'NET_BANKING'
  | 'WALLET'
  | 'OTHER';

export type PaymentDirection = 'INBOUND' | 'OUTBOUND';

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type PlanTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type MemberRole = 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'VIEWER';

// ─── Core entities ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  legalName: string | null;
  gstin: string | null;
  pan: string | null;
  businessType: BusinessType;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankBranch: string | null;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  financialYearStart: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessMember {
  id: string;
  userId: string;
  businessId: string;
  role: MemberRole;
  user: Pick<User, 'id' | 'email' | 'name'>;
  createdAt: string;
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductCategory {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  hsnCode: string | null;
  sacCode: string | null;
  unit: string;
  sellingPrice: string;
  purchasePrice: string | null;
  gstRate: number;
  cess: string;
  trackStock: boolean;
  currentStock: string;
  lowStockThreshold: string | null;
  isActive: boolean;
  category: ProductCategory | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Customers & Suppliers ───────────────────────────────────────────────────

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  pan: string | null;
  billingAddressLine1: string | null;
  billingAddressLine2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPincode: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPincode: string | null;
  totalInvoiced: string;
  totalReceived: string;
  outstandingBalance: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  pan: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  totalPurchased: string;
  totalPaid: string;
  outstandingBalance: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string | null;
  description: string;
  hsnCode: string | null;
  sacCode: string | null;
  quantity: string;
  unit: string;
  rate: string;
  discount: string;
  taxableAmount: string;
  gstRate: number;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  cessAmount: string;
  totalAmount: string;
  product: Pick<Product, 'id' | 'name'> | null;
}

export interface Invoice {
  id: string;
  businessId: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  isInterState: boolean;
  status: InvoiceStatus;
  subtotal: string;
  totalDiscount: string;
  totalTaxableAmount: string;
  totalCgst: string;
  totalSgst: string;
  totalIgst: string;
  totalCess: string;
  totalTax: string;
  roundOff: string;
  grandTotal: string;
  amountPaid: string;
  balanceDue: string;
  notes: string | null;
  termsAndConditions: string | null;
  customer: Pick<Customer, 'id' | 'name' | 'gstin' | 'billingState'>;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Purchases ───────────────────────────────────────────────────────────────

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string | null;
  description: string;
  hsnCode: string | null;
  quantity: string;
  unit: string;
  rate: string;
  discount: string;
  taxableAmount: string;
  gstRate: number;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  cessAmount: string;
  totalAmount: string;
  product: Pick<Product, 'id' | 'name'> | null;
}

export interface Purchase {
  id: string;
  businessId: string;
  supplierId: string;
  billNumber: string;
  billDate: string;
  dueDate: string | null;
  placeOfSupply: string;
  isInterState: boolean;
  status: PurchaseStatus;
  subtotal: string;
  totalDiscount: string;
  totalTaxableAmount: string;
  totalCgst: string;
  totalSgst: string;
  totalIgst: string;
  totalCess: string;
  totalTax: string;
  grandTotal: string;
  amountPaid: string;
  balanceDue: string;
  notes: string | null;
  supplier: Pick<Supplier, 'id' | 'name' | 'gstin'>;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  businessId: string;
  invoiceId: string | null;
  purchaseId: string | null;
  customerId: string | null;
  supplierId: string | null;
  direction: PaymentDirection;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export interface StockMovement {
  id: string;
  businessId: string;
  productId: string;
  type: StockMovementType;
  quantity: string;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  product: Pick<Product, 'id' | 'name'>;
  createdAt: string;
}

// ─── Plans & Subscriptions ──────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  monthlyPrice: string;
  annualPrice: string;
  maxBusinesses: number;
  maxInvoicesPerMonth: number;
  maxProducts: number;
  maxCustomers: number;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

// ─── API generics ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

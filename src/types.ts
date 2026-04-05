/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EntityStatus = 'draft' | 'finalized' | 'closed' | 'cancelled' | 'pending' | 'deposited' | 'reconciled' | 'exception' | 'planned' | 'due' | 'paid';

export interface Service {
  id: string;
  date: string;
  type: string;
  location: string;
  notes: string;
  status: 'draft' | 'finalized' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface CashBreakdown {
  notes: {
    '50': number;
    '20': number;
    '10': number;
    '5': number;
    '1': number;
  };
  coins: {
    '2': number;
    '1': number;
    '0.5': number;
    '0.2': number;
    '0.1': number;
    '0.05': number;
    '0.02': number;
    '0.01': number;
  };
}

export interface NonCashItem {
  id: string;
  type: 'bank_transfer' | 'direct_deposit' | 'external_donation' | 'other';
  reference: string;
  amount: number;
  note: string;
}

export interface CashCount {
  id: string;
  serviceId: string;
  countedBy: string;
  checkedBy: string;
  countedAt: string;
  categoryTotals: {
    tithes: number;
    offering: number;
    donation: number;
    mission: number;
    special: number;
    other: number;
  };
  cashBreakdown: CashBreakdown;
  nonCashItems: NonCashItem[];
  totalCash: number;
  totalNonCash: number;
  totalAmount: number;
  variance: number;
  status: 'draft' | 'finalized';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashBatch {
  id: string;
  serviceId: string;
  cashCountId: string;
  amount: number;
  custodian: string;
  storedAt: string;
  depositDueDate: string;
  depositDate?: string;
  depositReference?: string;
  bankAccountId?: string;
  status: 'pending_deposit' | 'deposited' | 'reconciled' | 'exception';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  date: string;
  dueDate: string;
  category: string;
  description: string;
  payee: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'direct_debit' | 'other';
  source: 'cash' | 'bank';
  serviceId?: string;
  status: 'planned' | 'due' | 'paid' | 'cancelled';
  notes: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  amount: number;
  balance: number;
  type: string;
  reconciliationStatus: 'unreconciled' | 'suggested' | 'matched' | 'exception';
  classification?: string;
  notes?: string;
  importSource: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationMatch {
  id: string;
  matchType: 'cash_batch' | 'non_cash_income' | 'expense' | 'bank_only';
  sourceEntity: 'CashBatch' | 'NonCashItem' | 'Expense';
  sourceId: string;
  targetEntity: 'BankTransaction';
  targetId: string;
  matchedAmount: number;
  status: 'matched' | 'partially_matched' | 'exception';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyClose {
  id: string;
  month: number; // 1-12
  year: number;
  status: 'open' | 'closed';
  checklist: {
    servicesReviewed: boolean;
    cashCountsFinalized: boolean;
    depositsRegistered: boolean;
    expensesClassified: boolean;
    bankImported: boolean;
    reconciliationReviewed: boolean;
    exceptionsReviewed: boolean;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netResult: number;
    pendingDeposits: number;
    unreconciledBankItems: number;
  };
  notes: string;
  closedAt?: string;
  reopenedAt?: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  timestamp: string;
  summary: string;
  userId?: string;
}

export interface Settings {
  churchName: string;
  branch: string;
  country: string;
  currency: string;
  reportingFrequency: 'monthly' | 'quarterly';
  categories: {
    id: string;
    label: string;
    type: 'income' | 'expense';
    reportMapping: string;
    active: boolean;
  }[];
  serviceTypes: string[];
  bankAccounts: {
    id: string;
    name: string;
    label: string;
    mask: string;
    active: boolean;
  }[];
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Service, 
  CashCount, 
  CashBatch, 
  Expense, 
  BankTransaction, 
  ReconciliationMatch, 
  MonthlyClose, 
  AuditLog, 
  Settings 
} from '../types';

const STORAGE_KEY_PREFIX = 'jcim_derby_';

export class StorageService {
  private static get<T>(key: string): T[] {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return data ? JSON.parse(data) : [];
  }

  private static set<T>(key: string, data: T[]): void {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  }

  private static getOne<T>(key: string): T | null {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return data ? JSON.parse(data) : null;
  }

  private static setOne<T>(key: string, data: T): void {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  }

  // Generic CRUD
  static getAll<T extends { id: string }>(key: string): T[] {
    return this.get<T>(key);
  }

  static findById<T extends { id: string }>(key: string, id: string): T | undefined {
    return this.get<T>(key).find(item => item.id === id);
  }

  static save<T extends { id: string }>(key: string, item: T): void {
    const items = this.get<T>(key);
    const index = items.findIndex(i => i.id === item.id);
    const now = new Date().toISOString();
    
    const itemWithTimestamps = {
      ...item,
      updatedAt: now,
      createdAt: (item as any).createdAt || now
    };

    if (index >= 0) {
      items[index] = itemWithTimestamps;
    } else {
      items.push(itemWithTimestamps);
    }
    this.set(key, items);
    this.logAudit(key, item.id, index >= 0 ? 'update' : 'create', `Saved ${key} item`);
  }

  static delete<T extends { id: string }>(key: string, id: string): void {
    const items = this.get<T>(key);
    const filtered = items.filter(item => item.id !== id);
    this.set(key, filtered);
    this.logAudit(key, id, 'delete', `Deleted ${key} item`);
  }

  // Audit Logging
  static logAudit(entity: string, entityId: string, action: string, summary: string): void {
    const logs = this.get<AuditLog>('audit_logs');
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      entity,
      entityId,
      action,
      timestamp: new Date().toISOString(),
      summary
    };
    logs.unshift(newLog);
    this.set('audit_logs', logs.slice(0, 1000)); // Keep last 1000 logs
  }

  // Settings
  static getSettings(): Settings {
    const defaultSettings: Settings = {
      churchName: 'JCIM Derby',
      branch: 'Derby',
      country: 'United Kingdom',
      currency: 'GBP',
      reportingFrequency: 'quarterly',
      categories: [
        { id: 'tithes', label: 'Tithes', type: 'income', reportMapping: 'JCIM - Tithes', active: true },
        { id: 'offering', label: 'Offering', type: 'income', reportMapping: 'JCIM - Offering', active: true },
        { id: 'donation', label: 'Donation', type: 'income', reportMapping: 'Others - Donation', active: true },
        { id: 'mission', label: 'Mission', type: 'income', reportMapping: 'Others - Donation', active: true },
        { id: 'rent', label: 'Rent', type: 'expense', reportMapping: 'Rent JCIM Church', active: true },
        { id: 'pastor_stipend', label: 'Pastor Stipend', type: 'expense', reportMapping: 'Pastor Stipend', active: true },
        { id: 'love_gift', label: 'Love Gift', type: 'expense', reportMapping: 'Love Gift', active: true },
        { id: 'cleaning', label: 'Cleaning', type: 'expense', reportMapping: 'Household/Event', active: true },
        { id: 'transport', label: 'Transport', type: 'expense', reportMapping: 'Transportation', active: true },
        { id: 'admin', label: 'Admin', type: 'expense', reportMapping: 'Other', active: true },
      ],
      serviceTypes: ['Sunday Service', 'Mid-week Service', 'Special Event', 'Night Vigil'],
      bankAccounts: [
        { id: 'main_account', name: 'Barclays Main', label: 'Main Account', mask: '****1234', active: true }
      ]
    };
    return this.getOne<Settings>('settings') || defaultSettings;
  }

  static saveSettings(settings: Settings): void {
    this.setOne('settings', settings);
    this.logAudit('settings', 'global', 'update', 'Updated settings');
  }

  // Export/Import
  static exportData(): string {
    const allData: Record<string, any> = {};
    const keys = [
      'services', 'cash_counts', 'cash_batches', 'expenses', 
      'bank_transactions', 'reconciliations', 'monthly_closes', 
      'settings', 'audit_logs'
    ];
    keys.forEach(key => {
      allData[key] = this.get(key);
    });
    return JSON.stringify(allData, null, 2);
  }

  static importData(json: string): void {
    const data = JSON.parse(json);
    Object.keys(data).forEach(key => {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data[key]));
    });
    this.logAudit('system', 'global', 'import', 'Imported full database');
  }

  static resetDatabase(): void {
    const keys = [
      'services', 'cash_counts', 'cash_batches', 'expenses', 
      'bank_transactions', 'reconciliations', 'monthly_closes', 
      'settings', 'audit_logs'
    ];
    keys.forEach(key => {
      localStorage.removeItem(STORAGE_KEY_PREFIX + key);
    });
    this.logAudit('system', 'global', 'reset', 'Reset database');
  }

  // Mock Data Generation
  static generateMockData(): void {
    this.resetDatabase();
    
    // Create some services
    const services: Service[] = [
      {
        id: crypto.randomUUID(),
        date: '2026-03-01',
        type: 'Sunday Service',
        location: 'Derby Hall',
        notes: 'Monthly Thanksgiving',
        status: 'closed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        date: '2026-03-08',
        type: 'Sunday Service',
        location: 'Derby Hall',
        notes: 'Regular Service',
        status: 'closed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        date: '2026-03-15',
        type: 'Sunday Service',
        location: 'Derby Hall',
        notes: 'Special Guest',
        status: 'finalized',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    services.forEach(s => this.save('services', s));

    // Create a cash count for the first service
    const cashCount: CashCount = {
      id: crypto.randomUUID(),
      serviceId: services[0].id,
      countedBy: 'John Doe',
      checkedBy: 'Jane Smith',
      countedAt: '2026-03-01T13:00:00Z',
      categoryTotals: {
        tithes: 450,
        offering: 230,
        donation: 50,
        mission: 100,
        special: 0,
        other: 0
      },
      cashBreakdown: {
        notes: { '50': 4, '20': 10, '10': 15, '5': 10, '1': 30 },
        coins: { '2': 10, '1': 20, '0.5': 20, '0.2': 50, '0.1': 100, '0.05': 100, '0.02': 100, '0.01': 100 }
      },
      nonCashItems: [
        { id: crypto.randomUUID(), type: 'bank_transfer', reference: 'Tithes - Peter', amount: 100, note: 'Online' }
      ],
      totalCash: 730,
      totalNonCash: 100,
      totalAmount: 830,
      variance: 0,
      status: 'finalized',
      notes: 'All counted correctly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.save('cash_counts', cashCount);

    // Create a cash batch for that count
    const batch: CashBatch = {
      id: crypto.randomUUID(),
      serviceId: services[0].id,
      cashCountId: cashCount.id,
      amount: 730,
      custodian: 'John Doe',
      storedAt: 'Safe Box',
      depositDueDate: '2026-03-02',
      status: 'deposited',
      depositDate: '2026-03-02',
      depositReference: 'DEP123',
      bankAccountId: 'main_account',
      notes: 'Deposited at branch',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.save('cash_batches', batch);

    // Create some expenses
    const expenses: Expense[] = [
      {
        id: crypto.randomUUID(),
        date: '2026-03-05',
        dueDate: '2026-03-05',
        category: 'rent',
        description: 'Monthly Hall Rent',
        payee: 'Derby Council',
        amount: 400,
        paymentMethod: 'bank_transfer',
        source: 'bank',
        status: 'paid',
        notes: 'March Rent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        date: '2026-03-10',
        dueDate: '2026-03-10',
        category: 'cleaning',
        description: 'Cleaning Supplies',
        payee: 'Tesco',
        amount: 25.50,
        paymentMethod: 'cash',
        source: 'cash',
        status: 'paid',
        notes: 'Bought by John',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    expenses.forEach(e => this.save('expenses', e));

    // Create some bank transactions
    const transactions: BankTransaction[] = [
      {
        id: crypto.randomUUID(),
        bankAccountId: 'main_account',
        date: '2026-03-02',
        description: 'CREDIT DEP123',
        debit: 0,
        credit: 730,
        amount: 730,
        balance: 2500,
        type: 'credit',
        reconciliationStatus: 'matched',
        importSource: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        bankAccountId: 'main_account',
        date: '2026-03-05',
        description: 'DEBIT RENT MAR',
        debit: 400,
        credit: 0,
        amount: -400,
        balance: 2100,
        type: 'debit',
        reconciliationStatus: 'matched',
        importSource: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    transactions.forEach(t => this.save('bank_transactions', t));

    // Create reconciliation matches
    const matches: ReconciliationMatch[] = [
      {
        id: crypto.randomUUID(),
        matchType: 'cash_batch',
        sourceEntity: 'CashBatch',
        sourceId: batch.id,
        targetEntity: 'BankTransaction',
        targetId: transactions[0].id,
        matchedAmount: 730,
        status: 'matched',
        notes: 'Auto-matched',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        matchType: 'expense',
        sourceEntity: 'Expense',
        sourceId: expenses[0].id,
        targetEntity: 'BankTransaction',
        targetId: transactions[1].id,
        matchedAmount: 400,
        status: 'matched',
        notes: 'Manual match',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    matches.forEach(m => this.save('reconciliations', m));
  }
}

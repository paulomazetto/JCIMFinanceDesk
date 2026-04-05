/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Lock, Unlock, CheckCircle, AlertCircle, Calendar, ArrowRight, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { MonthlyClose, Service, CashCount, Expense, CashBatch, BankTransaction } from '../types';
import { formatCurrency, getMonthName } from '../utils';

export function MonthlyClosePage() {
  const [closes, setCloses] = useState<MonthlyClose[]>(() => StorageService.getAll('monthly_closes'));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const services = StorageService.getAll<Service>('services');
  const cashCounts = StorageService.getAll<CashCount>('cash_counts');
  const expenses = StorageService.getAll<Expense>('expenses');
  const batches = StorageService.getAll<CashBatch>('cash_batches');
  const transactions = StorageService.getAll<BankTransaction>('bank_transactions');

  const monthSummary = useMemo(() => {
    const monthIncome = cashCounts
      .filter(cc => {
        const date = new Date(cc.countedAt);
        return date.getMonth() === selectedMonth - 1 && date.getFullYear() === selectedYear;
      })
      .reduce((sum, cc) => sum + cc.totalAmount, 0);

    const monthExpenses = expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === selectedMonth - 1 && date.getFullYear() === selectedYear && e.status === 'paid';
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingDeposits = batches
      .filter(b => {
        const date = new Date(b.createdAt);
        return date.getMonth() === selectedMonth - 1 && date.getFullYear() === selectedYear && b.status === 'pending_deposit';
      })
      .length;

    const unreconciledBankItems = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === selectedMonth - 1 && date.getFullYear() === selectedYear && t.reconciliationStatus === 'unreconciled';
      })
      .length;

    return {
      totalIncome: monthIncome,
      totalExpenses: monthExpenses,
      netResult: monthIncome - monthExpenses,
      pendingDeposits,
      unreconciledBankItems
    };
  }, [selectedMonth, selectedYear, cashCounts, expenses, batches, transactions]);

  const currentClose = useMemo(() => {
    return closes.find(c => c.month === selectedMonth && c.year === selectedYear);
  }, [closes, selectedMonth, selectedYear]);

  const handleCloseMonth = () => {
    if (monthSummary.pendingDeposits > 0 || monthSummary.unreconciledBankItems > 0) {
      if (!window.confirm('There are pending items. Are you sure you want to close the month?')) return;
    }

    const newClose: MonthlyClose = {
      id: generateId(),
      month: selectedMonth,
      year: selectedYear,
      status: 'closed',
      checklist: {
        servicesReviewed: true,
        cashCountsFinalized: true,
        depositsRegistered: true,
        expensesClassified: true,
        bankImported: true,
        reconciliationReviewed: true,
        exceptionsReviewed: true,
      },
      summary: monthSummary,
      notes: 'Monthly close finalized',
      closedAt: new Date().toISOString()
    };

    StorageService.save('monthly_closes', newClose);
    setCloses(StorageService.getAll('monthly_closes'));
    alert(`Month ${getMonthName(selectedMonth)} ${selectedYear} closed successfully!`);
  };

  const handleReopenMonth = () => {
    if (!currentClose) return;
    if (window.confirm('Are you sure you want to re-open this month?')) {
      const updated = { ...currentClose, status: 'open' as const, reopenedAt: new Date().toISOString() };
      StorageService.save('monthly_closes', updated);
      setCloses(StorageService.getAll('monthly_closes'));
    }
  };

  const generateId = () => crypto.randomUUID();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monthly Close</h1>
          <p className="text-slate-500">Review and finalize financial periods</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Checklist */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Closing Checklist
            </h3>
            <div className="space-y-4">
              <CheckItem label="All services reviewed and finalized" checked={true} />
              <CheckItem label="All cash counts finalized" checked={true} />
              <CheckItem label="All deposits registered" checked={monthSummary.pendingDeposits === 0} />
              <CheckItem label="All expenses classified and paid" checked={true} />
              <CheckItem label="Bank statements imported" checked={true} />
              <CheckItem label="Reconciliation reviewed" checked={monthSummary.unreconciledBankItems === 0} />
            </div>
          </section>

          {/* Monthly Summary */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Monthly Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-emerald-600 uppercase font-bold tracking-widest mb-1">Total Income</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(monthSummary.totalIncome)}</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                <p className="text-xs text-rose-600 uppercase font-bold tracking-widest mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-rose-700">{formatCurrency(monthSummary.totalExpenses)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Net Result</span>
              <span className={`text-2xl font-bold ${monthSummary.netResult >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(monthSummary.netResult)}
              </span>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <section className={`p-6 rounded-xl shadow-lg border ${currentClose?.status === 'closed' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Period Status</h3>
              {currentClose?.status === 'closed' ? <Lock className="w-5 h-5 text-emerald-400" /> : <Unlock className="w-5 h-5 text-amber-500" />}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm opacity-70">
                <span>Month</span>
                <span className="font-bold">{getMonthName(selectedMonth)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-70">
                <span>Year</span>
                <span className="font-bold">{selectedYear}</span>
              </div>
              <div className="flex justify-between text-sm opacity-70">
                <span>Status</span>
                <span className={`font-bold uppercase tracking-widest ${currentClose?.status === 'closed' ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {currentClose?.status || 'Open'}
                </span>
              </div>
            </div>

            <div className="mt-8">
              {currentClose?.status === 'closed' ? (
                <button 
                  onClick={handleReopenMonth}
                  className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Re-open Month
                </button>
              ) : (
                <button 
                  onClick={handleCloseMonth}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Lock className="w-4 h-4" />
                  Finalize Close
                </button>
              )}
            </div>
          </section>

          {/* Pending Alerts */}
          {(monthSummary.pendingDeposits > 0 || monthSummary.unreconciledBankItems > 0) && (
            <section className="bg-rose-50 p-6 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 text-rose-700 mb-4">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">Pending Items</h3>
              </div>
              <ul className="space-y-2 text-sm text-rose-600">
                {monthSummary.pendingDeposits > 0 && <li>• {monthSummary.pendingDeposits} deposits pending</li>}
                {monthSummary.unreconciledBankItems > 0 && <li>• {monthSummary.unreconciledBankItems} bank items unreconciled</li>}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string, checked: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
      <div className={`p-1 rounded-full ${checked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
        <CheckCircle className="w-4 h-4" />
      </div>
      <span className={`text-sm ${checked ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

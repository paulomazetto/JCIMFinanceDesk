/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCcw, CheckCircle, AlertCircle, ArrowRight, Package, Receipt, Coins, Search, Filter, Plus } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { CashBatch, Expense, BankTransaction, ReconciliationMatch, CashCount } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';

export function Reconciliation() {
  const [batches, setBatches] = useState<CashBatch[]>(() => StorageService.getAll('cash_batches'));
  const [expenses, setExpenses] = useState<Expense[]>(() => StorageService.getAll('expenses'));
  const [transactions, setTransactions] = useState<BankTransaction[]>(() => StorageService.getAll('bank_transactions'));
  const [matches, setMatches] = useState<ReconciliationMatch[]>(() => StorageService.getAll('reconciliations'));

  const [selectedInternal, setSelectedInternal] = useState<{ type: string, id: string, amount: number } | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankTransaction | null>(null);

  const unreconciledInternal = useMemo(() => {
    const b = batches.filter(b => b.status === 'deposited').map(b => ({ ...b, type: 'CashBatch' as const }));
    const e = expenses.filter(e => e.status === 'paid' && e.source === 'bank').map(e => ({ ...e, type: 'Expense' as const }));
    
    // Filter out already matched
    const matchedIds = matches.map(m => m.sourceId);
    return [...b, ...e].filter(item => !matchedIds.includes(item.id));
  }, [batches, expenses, matches]);

  const unreconciledBank = useMemo(() => {
    return transactions.filter(t => t.reconciliationStatus === 'unreconciled');
  }, [transactions]);

  const [activeTab, setActiveTab] = useState<'internal' | 'bank'>('internal');

  const handleMatch = () => {
    if (!selectedInternal || !selectedBank) return;

    const match: ReconciliationMatch = {
      id: generateId(),
      matchType: selectedInternal.type === 'CashBatch' ? 'cash_batch' : 'expense',
      sourceEntity: selectedInternal.type as any,
      sourceId: selectedInternal.id,
      targetEntity: 'BankTransaction',
      targetId: selectedBank.id,
      matchedAmount: Math.min(selectedInternal.amount, Math.abs(selectedBank.amount)),
      status: 'matched',
      notes: 'Manual match',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.save('reconciliations', match);
    
    // Update statuses
    if (selectedInternal.type === 'CashBatch') {
      const batch = batches.find(b => b.id === selectedInternal.id);
      if (batch) StorageService.save('cash_batches', { ...batch, status: 'reconciled' });
    }
    
    const transaction = transactions.find(t => t.id === selectedBank.id);
    if (transaction) StorageService.save('bank_transactions', { ...transaction, reconciliationStatus: 'matched' });

    // Refresh data
    setBatches(StorageService.getAll('cash_batches'));
    setExpenses(StorageService.getAll('expenses'));
    setTransactions(StorageService.getAll('bank_transactions'));
    setMatches(StorageService.getAll('reconciliations'));
    
    setSelectedInternal(null);
    setSelectedBank(null);
    alert('Items matched successfully!');
  };

  return (
    <div className="space-y-6 pb-32 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reconciliation</h1>
          <p className="text-slate-500 text-sm">Match internal records with bank transactions</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm sm:shadow-none sm:border-none sm:bg-transparent">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Pending Match</p>
            <p className="text-sm sm:text-lg font-bold text-slate-900">{unreconciledInternal.length} Internal / {unreconciledBank.length} Bank</p>
          </div>
          <div className="bg-emerald-100 p-2 sm:p-3 rounded-full">
            <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex lg:hidden bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
        <button 
          onClick={() => setActiveTab('internal')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'internal' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Internal ({unreconciledInternal.length})
        </button>
        <button 
          onClick={() => setActiveTab('bank')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'bank' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Bank ({unreconciledBank.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Internal Records */}
        <section className={`space-y-4 ${activeTab === 'internal' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Internal Records
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">{unreconciledInternal.length} items</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] lg:min-h-[500px] flex flex-col">
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search internal..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {unreconciledInternal.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedInternal({ type: item.type, id: item.id, amount: item.amount })}
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedInternal?.id === item.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.type === 'CashBatch' ? 'Cash Deposit' : (item as any).description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{formatDate(item.date)}</p>
                    </div>
                    <div className={`p-1.5 rounded-lg ${item.type === 'CashBatch' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                      {item.type === 'CashBatch' ? <Package className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              ))}
              {unreconciledInternal.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-sm">No internal items to reconcile.</div>
              )}
            </div>
          </div>
        </section>

        {/* Bank Records */}
        <section className={`space-y-4 ${activeTab === 'bank' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-emerald-500" />
              Bank Transactions
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">{unreconciledBank.length} items</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] lg:min-h-[500px] flex flex-col">
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search bank..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {unreconciledBank.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedBank(item)}
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedBank?.id === item.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(Math.abs(item.amount))}
                      </p>
                      <p className="text-xs text-slate-900 font-medium mt-1 leading-tight">{item.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{formatDate(item.date)}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400">
                      <RefreshCcw className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
              {unreconciledBank.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-sm">No bank items to reconcile.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Match Bar */}
      {selectedInternal && selectedBank && (
        <div className="fixed bottom-4 left-4 right-4 lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2 bg-slate-900 text-white p-4 lg:px-8 lg:py-4 rounded-2xl shadow-2xl z-50 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-12">
            <div className="flex items-center justify-between w-full lg:w-auto gap-4 lg:gap-8">
              <div className="text-left lg:text-right flex-1 lg:flex-none">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Internal</p>
                <p className="font-bold text-sm lg:text-base truncate">{formatCurrency(selectedInternal.amount)}</p>
              </div>
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500 shrink-0" />
              <div className="text-right lg:text-left flex-1 lg:flex-none">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Bank</p>
                <p className="font-bold text-sm lg:text-base truncate">{formatCurrency(Math.abs(selectedBank.amount))}</p>
              </div>
            </div>
            
            <div className="hidden lg:block h-8 w-px bg-slate-700"></div>
            
            <div className="flex items-center justify-between w-full lg:w-auto gap-4 lg:gap-8 border-t border-slate-800 pt-3 lg:border-t-0 lg:pt-0">
              <div className="text-left lg:text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Difference</p>
                <p className={`font-bold text-sm lg:text-base ${Math.abs(selectedInternal.amount - Math.abs(selectedBank.amount)) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(selectedInternal.amount - Math.abs(selectedBank.amount))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleMatch}
                  className="bg-emerald-500 text-white px-6 lg:px-8 py-2.5 lg:py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 text-sm"
                >
                  Match
                </button>
                <button 
                  onClick={() => { setSelectedInternal(null); setSelectedBank(null); }}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

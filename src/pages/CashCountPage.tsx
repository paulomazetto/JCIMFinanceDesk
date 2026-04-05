/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Save, CheckCircle, AlertCircle, Calculator, ArrowRight, Clock, Coins, RefreshCcw } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { CashCount, CashBatch, Service, NonCashItem } from '../types';
import { formatCurrency, generateId, formatDate } from '../utils';

const NOTE_DENOMINATIONS = [50, 20, 10, 5, 1];
const COIN_DENOMINATIONS = [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];

export function CashCountPage() {
  const services = useMemo(() => StorageService.getAll<Service>('services').filter(s => s.status !== 'closed'), []);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [countedBy, setCountedBy] = useState('');
  const [checkedBy, setCheckedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'categories' | 'cash' | 'non-cash'>('info');
  
  const [categoryTotals, setCategoryTotals] = useState({
    tithes: 0, offering: 0, donation: 0, mission: 0, special: 0, other: 0
  });

  const [noteQtys, setNoteQtys] = useState<Record<string, number>>({
    '50': 0, '20': 0, '10': 0, '5': 0, '1': 0
  });

  const [coinQtys, setCoinQtys] = useState<Record<string, number>>({
    '2': 0, '1': 0, '0.5': 0, '0.2': 0, '0.1': 0, '0.05': 0, '0.02': 0, '0.01': 0
  });

  const [nonCashItems, setNonCashItems] = useState<NonCashItem[]>([]);

  // Totals
  const totalByCategories = useMemo(() => {
    return Object.values(categoryTotals).reduce((sum: number, val: number) => sum + val, 0);
  }, [categoryTotals]);

  const totalNotes = useMemo(() => {
    return Object.entries(noteQtys).reduce((sum: number, [denom, qty]: [string, number]) => sum + (Number(denom) * qty), 0);
  }, [noteQtys]);

  const totalCoins = useMemo(() => {
    return Object.entries(coinQtys).reduce((sum: number, [denom, qty]: [string, number]) => sum + (Number(denom) * qty), 0);
  }, [coinQtys]);

  const totalCash = totalNotes + totalCoins;

  const totalNonCash = useMemo(() => {
    return nonCashItems.reduce((sum, item) => sum + item.amount, 0);
  }, [nonCashItems]);

  const totalCalculated = totalCash + totalNonCash;
  const variance = totalCalculated - totalByCategories;

  const handleAddNonCash = () => {
    setNonCashItems([...nonCashItems, { id: generateId(), type: 'bank_transfer', reference: '', amount: 0, note: '' }]);
  };

  const handleRemoveNonCash = (id: string) => {
    setNonCashItems(nonCashItems.filter(item => item.id !== id));
  };

  const handleUpdateNonCash = (id: string, field: keyof NonCashItem, value: any) => {
    setNonCashItems(nonCashItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = (status: 'draft' | 'finalized') => {
    if (!selectedServiceId) {
      alert('Please select a service');
      return;
    }

    const cashCount: CashCount = {
      id: generateId(),
      serviceId: selectedServiceId,
      countedBy,
      checkedBy,
      countedAt: new Date().toISOString(),
      categoryTotals,
      cashBreakdown: {
        notes: noteQtys as any,
        coins: coinQtys as any
      },
      nonCashItems,
      totalCash,
      totalNonCash,
      totalAmount: totalCalculated,
      variance,
      status,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.save('cash_counts', cashCount);

    if (status === 'finalized' && totalCash > 0) {
      const batch: CashBatch = {
        id: generateId(),
        serviceId: selectedServiceId,
        cashCountId: cashCount.id,
        amount: totalCash,
        custodian: countedBy,
        storedAt: 'Safe Box',
        depositDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        status: 'pending_deposit',
        notes: `Batch from service count ${formatDate(new Date())}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      StorageService.save('cash_batches', batch);
      alert('Cash count finalized and cash batch created!');
    } else {
      alert('Cash count saved as draft.');
    }

    // Reset form or redirect
    window.location.href = '/';
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">New Cash Count</h1>
          <p className="text-sm text-slate-500">Record income and cash composition after service</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button 
            onClick={() => handleSave('draft')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all font-bold uppercase tracking-wider text-[10px] sm:text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Draft</span>
          </button>
          <button 
            onClick={() => handleSave('finalized')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 md:px-4 py-2.5 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all font-bold uppercase tracking-wider shadow-sm text-[10px] sm:text-xs"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Finalize</span>
          </button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden flex overflow-x-auto no-scrollbar border-b border-slate-200 -mx-4 px-4 sticky top-16 bg-slate-50/80 backdrop-blur-sm z-20">
        <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Info" icon={Clock} />
        <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} label="Categories" icon={Calculator} />
        <TabButton active={activeTab === 'cash'} onClick={() => setActiveTab('cash')} label="Cash" icon={Coins} />
        <TabButton active={activeTab === 'non-cash'} onClick={() => setActiveTab('non-cash')} label="Non-Cash" icon={RefreshCcw} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Service & Team */}
          <section className={`${activeTab === 'info' ? 'block' : 'hidden lg:block'} bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6`}>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <Clock className="w-5 h-5 text-emerald-500" />
              Service & Team
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Service</label>
                <select 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                >
                  <option value="">Choose a service...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{formatDate(s.date)} - {s.type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Counted By</label>
                <input 
                  type="text" 
                  placeholder="Name"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  value={countedBy}
                  onChange={(e) => setCountedBy(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Checked By</label>
                <input 
                  type="text" 
                  placeholder="Name"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  value={checkedBy}
                  onChange={(e) => setCheckedBy(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Income Categories */}
          <section className={`${activeTab === 'categories' ? 'block' : 'hidden lg:block'} bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6`}>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <Calculator className="w-5 h-5 text-emerald-500" />
              Income by Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {Object.keys(categoryTotals).map(cat => (
                <div key={cat} className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider capitalize">{cat}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">£</span>
                    <input 
                      type="number" 
                      step="0.01"
                      inputMode="decimal"
                      className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                      value={categoryTotals[cat as keyof typeof categoryTotals] || ''}
                      onChange={(e) => setCategoryTotals({ ...categoryTotals, [cat]: Number(e.target.value) })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Subtotal</span>
              <span className="text-lg sm:text-xl font-black text-slate-900">{formatCurrency(totalByCategories)}</span>
            </div>
          </section>

          {/* Cash Breakdown */}
          <section className={`${activeTab === 'cash' ? 'block' : 'hidden lg:block'} bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6`}>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <Coins className="w-5 h-5 text-emerald-500" />
              Cash Composition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Notes */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Notes</h4>
                <div className="space-y-2">
                  {NOTE_DENOMINATIONS.map(denom => (
                    <div key={denom} className="flex items-center gap-3">
                      <span className="w-10 text-xs font-bold text-slate-600">£{denom}</span>
                      <input 
                        type="number" 
                        min="0"
                        inputMode="numeric"
                        placeholder="0"
                        className="w-20 px-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-center"
                        value={noteQtys[denom.toString()] || ''}
                        onChange={(e) => setNoteQtys({ ...noteQtys, [denom.toString()]: Number(e.target.value) })}
                      />
                      <span className="flex-1 text-right text-xs font-bold text-slate-400">
                        {formatCurrency(Number(denom) * (noteQtys[denom.toString()] || 0))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-black text-slate-900 uppercase tracking-wider">
                  <span>Total Notes</span>
                  <span>{formatCurrency(totalNotes)}</span>
                </div>
              </div>

              {/* Coins */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Coins</h4>
                <div className="space-y-2">
                  {COIN_DENOMINATIONS.map(denom => (
                    <div key={denom} className="flex items-center gap-3">
                      <span className="w-10 text-[10px] font-bold text-slate-600">£{denom.toFixed(2)}</span>
                      <input 
                        type="number" 
                        min="0"
                        inputMode="numeric"
                        placeholder="0"
                        className="w-20 px-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-center"
                        value={coinQtys[denom.toString()] || ''}
                        onChange={(e) => setCoinQtys({ ...coinQtys, [denom.toString()]: Number(e.target.value) })}
                      />
                      <span className="flex-1 text-right text-[10px] font-bold text-slate-400">
                        {formatCurrency(Number(denom) * (coinQtys[denom.toString()] || 0))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-black text-slate-900 uppercase tracking-wider">
                  <span>Total Coins</span>
                  <span>{formatCurrency(totalCoins)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Cash Items */}
          <section className={`${activeTab === 'non-cash' ? 'block' : 'hidden lg:block'} bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                <RefreshCcw className="w-5 h-5 text-emerald-500" />
                Non-Cash Items
              </h3>
              <button 
                onClick={handleAddNonCash}
                className="text-emerald-600 hover:text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {nonCashItems.map(item => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 relative">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                    <select 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-sm"
                      value={item.type}
                      onChange={(e) => handleUpdateNonCash(item.id, 'type', e.target.value)}
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="direct_deposit">Direct Deposit</option>
                      <option value="external_donation">External Donation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Reference</label>
                    <input 
                      type="text" 
                      placeholder="Reference"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-sm"
                      value={item.reference}
                      onChange={(e) => handleUpdateNonCash(item.id, 'reference', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">£</span>
                      <input 
                        type="number" 
                        step="0.01"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-sm font-bold"
                        value={item.amount || ''}
                        onChange={(e) => handleUpdateNonCash(item.id, 'amount', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Note</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Note"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-sm"
                        value={item.note}
                        onChange={(e) => handleUpdateNonCash(item.id, 'note', e.target.value)}
                      />
                      <button 
                        onClick={() => handleRemoveNonCash(item.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 active:scale-90 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {nonCashItems.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-100 rounded-xl">
                  No non-cash items added.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <section className="bg-slate-900 text-white p-6 rounded-xl shadow-lg sticky top-24 hidden lg:block">
            <h3 className="font-bold text-lg mb-6 border-b border-slate-800 pb-4">Count Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Total Cash (Physical)</span>
                <span className="text-white font-medium">{formatCurrency(totalCash)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Total Non-Cash</span>
                <span className="text-white font-medium">{formatCurrency(totalNonCash)}</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="font-bold">Total Calculated</span>
                <span className="text-2xl font-bold text-emerald-400">{formatCurrency(totalCalculated)}</span>
              </div>
              
              <div className="pt-8 space-y-2">
                <div className="flex justify-between text-slate-400 text-xs uppercase tracking-widest">
                  <span>Expected (Categories)</span>
                  <span>{formatCurrency(totalByCategories)}</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg ${Math.abs(variance) < 0.01 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <span className="text-sm font-bold">Variance</span>
                  <span className="text-lg font-bold">{formatCurrency(variance)}</span>
                </div>
                {Math.abs(variance) >= 0.01 && (
                  <div className="flex items-start gap-2 text-[10px] text-rose-400/80 mt-2">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <p>The total composition does not match the category totals. Please review the count.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">General Notes</label>
                <textarea 
                  className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm p-3 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  rows={4}
                  placeholder="Any observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Sticky Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 border-t border-slate-800 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Calculated</span>
            <span className="text-lg font-black text-emerald-400 leading-none">{formatCurrency(totalCalculated)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Variance</span>
            <span className={`text-lg font-black leading-none ${Math.abs(variance) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(variance)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleSave('draft')}
            className="flex-1 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold uppercase tracking-wider"
          >
            Draft
          </button>
          <button 
            onClick={() => handleSave('finalized')}
            className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider"
          >
            Finalize
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
        active 
          ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' 
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

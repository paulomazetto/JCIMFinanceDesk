/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Package, Search, Filter, ArrowRight, CheckCircle, Clock, AlertCircle, Building2 } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { CashBatch, Service } from '../types';
import { formatCurrency, formatDate } from '../utils';

export function CashBatches() {
  const [batches, setBatches] = useState<CashBatch[]>(() => StorageService.getAll('cash_batches'));
  const services = useMemo(() => StorageService.getAll<Service>('services'), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<CashBatch | null>(null);

  const filteredBatches = useMemo(() => {
    return batches
      .filter(b => 
        b.custodian.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.depositReference?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [batches, searchTerm]);

  const handleRegisterDeposit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const formData = new FormData(e.currentTarget);
    const updatedBatch: CashBatch = {
      ...selectedBatch,
      depositDate: formData.get('depositDate') as string,
      depositReference: formData.get('depositReference') as string,
      bankAccountId: formData.get('bankAccountId') as string,
      status: 'deposited',
      notes: formData.get('notes') as string,
      updatedAt: new Date().toISOString()
    };

    StorageService.save('cash_batches', updatedBatch);
    setBatches(StorageService.getAll('cash_batches'));
    setSelectedBatch(null);
  };

  const getServiceInfo = (serviceId: string) => {
    return services.find(s => s.id === serviceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Batches</h1>
          <p className="text-slate-500">Track physical cash from count to bank deposit</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search batches..." 
            className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-600 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredBatches.map(batch => {
          const service = getServiceInfo(batch.serviceId);
          return (
            <div key={batch.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-emerald-200 transition-colors">
              <div className="p-5 sm:p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                    batch.status === 'reconciled' ? 'bg-emerald-100 text-emerald-700' : 
                    batch.status === 'deposited' ? 'bg-blue-100 text-blue-700' : 
                    batch.status === 'exception' ? 'bg-rose-100 text-rose-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {batch.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(batch.amount)}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">
                    {service ? `${service.type} - ${formatDate(service.date)}` : 'Unknown Service'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium">Due: {formatDate(batch.depositDueDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">Custodian: {batch.custodian}</span>
                  </div>
                  {batch.depositDate && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span className="font-bold">Deposited: {formatDate(batch.depositDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100">
                {batch.status === 'pending_deposit' ? (
                  <button 
                    onClick={() => setSelectedBatch(batch)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
                  >
                    Register Deposit
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                    <span className="font-medium truncate mr-2">Ref: {batch.depositReference || 'N/A'}</span>
                    <button className="text-emerald-600 hover:underline font-bold uppercase tracking-wider shrink-0">Details</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredBatches.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 italic text-sm border-2 border-dashed border-slate-100 rounded-2xl">
            No cash batches found.
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Register Deposit</h3>
              <button onClick={() => setSelectedBatch(null)} className="p-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </button>
            </div>
            <form onSubmit={handleRegisterDeposit} className="p-6 space-y-5">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 mb-2">
                <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-1">Amount to Deposit</p>
                <p className="text-3xl font-black text-emerald-700">{formatCurrency(selectedBatch.amount)}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deposit Date</label>
                <input 
                  type="date" 
                  name="depositDate" 
                  required 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bank Account</label>
                <select 
                  name="bankAccountId" 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold bg-white"
                >
                  {StorageService.getSettings().bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.label} ({acc.mask})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deposit Reference</label>
                <input 
                  type="text" 
                  name="depositReference" 
                  required 
                  placeholder="e.g. DEP12345"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes</label>
                <textarea 
                  name="notes" 
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedBatch(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/20"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

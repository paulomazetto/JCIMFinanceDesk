/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Upload, Search, Filter, CheckCircle, AlertCircle, FileText, ArrowDown, ArrowUp, Trash2, Plus } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { BankTransaction } from '../types';
import { formatCurrency, formatDate, generateId, parseCSV } from '../utils';

export function BankLedger() {
  const [transactions, setTransactions] = useState<BankTransaction[]>(() => StorageService.getAll('bank_transactions'));
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.classification?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const data = parseCSV(csv);
      setImportPreview(data);
      setIsImporting(true);
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    const newTransactions: BankTransaction[] = importPreview.map(item => {
      const debit = Number(item.debit || 0);
      const credit = Number(item.credit || 0);
      const amount = credit - debit;
      
      return {
        id: generateId(),
        bankAccountId: 'main_account',
        date: item.date || new Date().toISOString().split('T')[0],
        description: item.description || item.memo || 'Bank Transaction',
        debit,
        credit,
        amount,
        balance: Number(item.balance || 0),
        type: amount >= 0 ? 'credit' : 'debit',
        reconciliationStatus: 'unreconciled',
        importSource: 'csv_import',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    newTransactions.forEach(t => StorageService.save('bank_transactions', t));
    setTransactions(StorageService.getAll('bank_transactions'));
    setIsImporting(false);
    setImportPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert(`${newTransactions.length} transactions imported successfully!`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      StorageService.delete('bank_transactions', id);
      setTransactions(StorageService.getAll('bank_transactions'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Bank Ledger</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Import and manage bank statements</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all text-sm font-bold uppercase tracking-wider shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 text-xs font-bold uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Transactions List/Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile List View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredTransactions.map(t => (
            <div key={t.id} className="p-3 space-y-2 active:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-tight truncate">{t.description}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{formatDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(t.amount)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">Bal: {formatCurrency(t.balance)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {t.classification && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                      {t.classification}
                    </span>
                  )}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                    t.reconciliationStatus === 'matched' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    t.reconciliationStatus === 'suggested' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                    t.reconciliationStatus === 'exception' ? 'bg-rose-100 text-rose-700 border-rose-200' : 
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {t.reconciliationStatus}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="p-2 -mr-2 text-slate-300 hover:text-rose-600 active:scale-90 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-slate-500 italic text-sm">
              No transactions found.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Debit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Credit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-slate-900">{t.description}</p>
                    {t.classification && (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">{t.classification}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-600 font-medium">
                    {t.debit > 0 ? formatCurrency(t.debit) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                    {t.credit > 0 ? formatCurrency(t.credit) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatCurrency(t.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.reconciliationStatus === 'matched' ? 'bg-emerald-100 text-emerald-700' : 
                      t.reconciliationStatus === 'suggested' ? 'bg-blue-100 text-blue-700' : 
                      t.reconciliationStatus === 'exception' ? 'bg-rose-100 text-rose-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {t.reconciliationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                    No transactions found. Import a CSV to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Preview Modal */}
      {isImporting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900">Preview Import ({importPreview.length} items)</h3>
              <button onClick={() => setIsImporting(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {Object.keys(importPreview[0] || {}).map(header => (
                          <th key={header} className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {importPreview.slice(0, 50).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-4 py-3 text-slate-600 whitespace-nowrap">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {importPreview.length > 50 && (
                <p className="text-center text-slate-400 text-[10px] sm:text-xs mt-4 italic">Showing first 50 items...</p>
              )}
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsImporting(false)}
                className="order-2 sm:order-1 px-6 py-3 sm:py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmImport}
                className="order-1 sm:order-2 px-6 py-3 sm:py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-bold text-sm shadow-lg shadow-emerald-500/20"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

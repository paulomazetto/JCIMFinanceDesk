/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Search, ArrowRight, TrendingUp, TrendingDown, Church } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { CashCount, Expense, Settings } from '../types';
import { formatCurrency, getQuarter } from '../utils';

export function QuarterlyReport() {
  const [selectedQuarter, setSelectedQuarter] = useState(getQuarter(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const cashCounts = StorageService.getAll<CashCount>('cash_counts');
  const expenses = StorageService.getAll<Expense>('expenses');
  const settings = StorageService.getSettings();

  const reportData = useMemo(() => {
    const quarterMonths = [
      (selectedQuarter - 1) * 3,
      (selectedQuarter - 1) * 3 + 1,
      (selectedQuarter - 1) * 3 + 2
    ];

    const quarterIncome = cashCounts.filter(cc => {
      const date = new Date(cc.countedAt);
      return quarterMonths.includes(date.getMonth()) && date.getFullYear() === selectedYear;
    });

    const quarterExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      return quarterMonths.includes(date.getMonth()) && date.getFullYear() === selectedYear && e.status === 'paid';
    });

    // Group by report mapping
    const incomeByMapping: Record<string, number> = {};
    const expenseByMapping: Record<string, number> = {};

    // Income
    quarterIncome.forEach(cc => {
      Object.entries(cc.categoryTotals).forEach(([catId, amount]) => {
        const cat = settings.categories.find(c => c.id === catId);
        const mapping = cat?.reportMapping || 'Others - Donation';
        incomeByMapping[mapping] = (incomeByMapping[mapping] || 0) + amount;
      });
      // Also add non-cash items
      cc.nonCashItems.forEach(item => {
        // For non-cash, we might need a better mapping, but for now use 'Others - Donation' or similar
        const mapping = 'Others - Donation';
        incomeByMapping[mapping] = (incomeByMapping[mapping] || 0) + item.amount;
      });
    });

    // Expenses
    quarterExpenses.forEach(e => {
      const cat = settings.categories.find(c => c.id === e.category);
      const mapping = cat?.reportMapping || 'Other';
      expenseByMapping[mapping] = (expenseByMapping[mapping] || 0) + e.amount;
    });

    const totalIncome = Object.values(incomeByMapping).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expenseByMapping).reduce((sum, val) => sum + val, 0);

    return {
      incomeByMapping,
      expenseByMapping,
      totalIncome,
      totalExpenses,
      netResult: totalIncome - totalExpenses
    };
  }, [selectedQuarter, selectedYear, cashCounts, expenses, settings]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `quarterly_report_Q${selectedQuarter}_${selectedYear}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-8 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quarterly Report</h1>
          <p className="text-slate-500">Standard financial statement for JCIM HQ</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(Number(e.target.value))}
          >
            <option value={1}>Q1 (Jan - Mar)</option>
            <option value={2}>Q2 (Apr - Jun)</option>
            <option value={3}>Q3 (Jul - Sep)</option>
            <option value={4}>Q4 (Oct - Dec)</option>
          </select>
          <select 
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
          <button 
            onClick={handleExportJSON}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Export JSON"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={handlePrint}
            className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
            title="Print Report"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
        <div className="p-12 space-y-12">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-xl">
                <Church className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{settings.churchName}</h2>
                <p className="text-slate-500 font-medium">{settings.branch} Branch • {settings.country}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Financial Statement</p>
              <p className="text-xl font-bold text-slate-900">Quarter {selectedQuarter}, {selectedYear}</p>
              <p className="text-xs text-slate-500 mt-1">Generated on {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Income Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-500 pl-4">Income</h3>
            <div className="divide-y divide-slate-50">
              {Object.entries(reportData.incomeByMapping).map(([mapping, amount]) => (
                <div key={mapping} className="py-3 flex justify-between items-center group">
                  <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{mapping}</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(amount as number)}</span>
                </div>
              ))}
              <div className="py-4 flex justify-between items-center border-t-2 border-slate-100 mt-2">
                <span className="text-slate-900 font-bold uppercase tracking-wider">Total Income</span>
                <span className="text-xl font-bold text-emerald-600">{formatCurrency(reportData.totalIncome)}</span>
              </div>
            </div>
          </section>

          {/* Expenses Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-rose-500 pl-4">Less Expenses</h3>
            <div className="divide-y divide-slate-50">
              {Object.entries(reportData.expenseByMapping).map(([mapping, amount]) => (
                <div key={mapping} className="py-3 flex justify-between items-center group">
                  <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{mapping}</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(amount as number)}</span>
                </div>
              ))}
              <div className="py-4 flex justify-between items-center border-t-2 border-slate-100 mt-2">
                <span className="text-slate-900 font-bold uppercase tracking-wider">Total Expenses</span>
                <span className="text-xl font-bold text-rose-600">{formatCurrency(reportData.totalExpenses)}</span>
              </div>
            </div>
          </section>

          {/* Result Section */}
          <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Quarterly Result</p>
                <h3 className="text-2xl font-bold text-slate-900">Net Surplus / Deficit</h3>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-black ${reportData.netResult >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(reportData.netResult)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {reportData.totalIncome > 0 ? `${((reportData.netResult / reportData.totalIncome) * 100).toFixed(1)}% of total income` : '0%'}
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-12 border-t border-slate-100 grid grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="border-b border-slate-200 pb-2">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-8">Prepared By</p>
                <div className="h-12"></div>
              </div>
              <p className="text-xs text-slate-500">Finance Officer / Treasurer</p>
            </div>
            <div className="space-y-8">
              <div className="border-b border-slate-200 pb-2">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-8">Checked By</p>
                <div className="h-12"></div>
              </div>
              <p className="text-xs text-slate-500">Pastor / Auditor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  Upload, 
  RefreshCcw, 
  Lock,
  Coins,
  Receipt,
  BookOpen
} from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { formatCurrency, formatDate } from '../utils';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const services = useMemo(() => StorageService.getAll('services'), []);
  const cashCounts = useMemo(() => StorageService.getAll('cash_counts'), []);
  const expenses = useMemo(() => StorageService.getAll('expenses'), []);
  const batches = useMemo(() => StorageService.getAll('cash_batches'), []);
  const transactions = useMemo(() => StorageService.getAll('bank_transactions'), []);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthIncome = cashCounts
      .filter(cc => {
        const date = new Date(cc.countedAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, cc) => sum + cc.totalAmount, 0);

    const monthExpenses = expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear && e.status === 'paid';
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingDeposits = batches
      .filter(b => b.status === 'pending_deposit')
      .reduce((sum, b) => sum + b.amount, 0);

    const pendingExpenses = expenses
      .filter(e => e.status === 'due' || e.status === 'planned')
      .reduce((sum, e) => sum + e.amount, 0);

    const unreconciledBankItems = transactions
      .filter(t => t.reconciliationStatus === 'unreconciled')
      .length;

    return {
      monthIncome,
      monthExpenses,
      netResult: monthIncome - monthExpenses,
      pendingDeposits,
      pendingExpenses,
      unreconciledBankItems
    };
  }, [cashCounts, expenses, batches, transactions]);

  const recentServices = useMemo(() => {
    return [...services].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [services]);

  const pendingBatches = useMemo(() => {
    return batches.filter(b => b.status === 'pending_deposit').slice(0, 5);
  }, [batches]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Operational Dashboard</h1>
          <p className="text-sm text-slate-500">Overview for {new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date())}</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link to="/services" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            <span>New Service</span>
          </Link>
          <Link to="/bank-ledger" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors text-sm">
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard 
          label="Month Income" 
          value={formatCurrency(stats.monthIncome)} 
          icon={TrendingUp} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
        />
        <StatCard 
          label="Month Expenses" 
          value={formatCurrency(stats.monthExpenses)} 
          icon={TrendingDown} 
          color="text-rose-600" 
          bgColor="bg-rose-50" 
        />
        <StatCard 
          label="Net Result" 
          value={formatCurrency(stats.netResult)} 
          icon={TrendingUp} 
          color={stats.netResult >= 0 ? "text-emerald-600" : "text-rose-600"} 
          bgColor={stats.netResult >= 0 ? "bg-emerald-50" : "bg-rose-50"} 
        />
        <StatCard 
          label="Pending Deposits" 
          value={formatCurrency(stats.pendingDeposits)} 
          icon={Clock} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
        />
      </div>

      {/* Alerts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Recent Services */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Recent Services</h3>
              <Link to="/services" className="text-xs sm:text-sm text-emerald-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentServices.length > 0 ? recentServices.map(service => (
                <div key={service.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="font-medium text-slate-900 text-sm sm:text-base truncate">{service.type}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">{formatDate(service.date)} • {service.location}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                      service.status === 'closed' ? 'bg-slate-100 text-slate-600' : 
                      service.status === 'finalized' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {service.status}
                    </span>
                    <Link to={`/services/${service.id}`} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500 italic text-sm">No services recorded yet.</div>
              )}
            </div>
          </section>

          {/* Pending Deposits */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Pending Deposits</h3>
              <Link to="/cash-batches" className="text-xs sm:text-sm text-emerald-600 hover:underline flex items-center gap-1">
                Manage Batches <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingBatches.length > 0 ? pendingBatches.map(batch => (
                <div key={batch.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="font-medium text-slate-900 text-sm sm:text-base">{formatCurrency(batch.amount)}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">Custodian: {batch.custodian} • Due: {formatDate(batch.depositDueDate)}</p>
                  </div>
                  <Link to={`/cash-batches/${batch.id}`} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-amber-200 transition-colors shrink-0">
                    Register
                  </Link>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500 italic text-sm">No pending deposits.</div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
              <QuickActionLink to="/cash-count" icon={Coins} label="Cash Count" />
              <QuickActionLink to="/expenses" icon={Receipt} label="Expense" />
              <QuickActionLink to="/reconciliation" icon={RefreshCcw} label="Reconcile" />
              <QuickActionLink to="/monthly-close" icon={Lock} label="Close Month" />
              <QuickActionLink to="/manual" icon={BookOpen} label="Manual" className="col-span-2 sm:col-span-1" />
            </div>
          </section>

          {/* Reconciliation Alerts */}
          <section className="bg-rose-50 rounded-xl border border-rose-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 text-rose-700 mb-4">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-sm sm:text-base">Reconciliation Alerts</h3>
            </div>
            <div className="space-y-3">
              {stats.unreconciledBankItems > 0 && (
                <div className="text-xs sm:text-sm text-rose-600">
                  You have <span className="font-bold">{stats.unreconciledBankItems}</span> bank items waiting to be reconciled.
                </div>
              )}
              {stats.pendingExpenses > 0 && (
                <div className="text-xs sm:text-sm text-rose-600">
                  Outstanding expenses total <span className="font-bold">{formatCurrency(stats.pendingExpenses)}</span>.
                </div>
              )}
              {stats.unreconciledBankItems === 0 && stats.pendingExpenses === 0 && (
                <div className="text-xs sm:text-sm text-emerald-600">
                  All clear! No urgent alerts.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-3 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1 sm:mb-4">
        <div className={`${bgColor} p-1.5 sm:p-2 rounded-lg`}>
          <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${color}`} />
        </div>
      </div>
      <div>
        <p className="text-[10px] sm:text-sm text-slate-500 mb-0.5 sm:mb-1 truncate">{label}</p>
        <p className={`text-sm sm:text-2xl font-bold text-slate-900 truncate`}>{value}</p>
      </div>
    </div>
  );
}

function QuickActionLink({ to, icon: Icon, label, className = "" }: any) {
  return (
    <Link to={to} className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-3 rounded-xl sm:rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group active:scale-95 ${className}`}>
      <div className="bg-slate-100 p-2 sm:p-2 rounded-lg group-hover:bg-emerald-100 transition-colors shrink-0">
        <Icon className="w-4 h-4 text-slate-600 group-hover:text-emerald-600" />
      </div>
      <span className="text-xs sm:text-sm font-bold sm:font-medium text-slate-700 truncate">{label}</span>
    </Link>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Coins, 
  Package, 
  Receipt, 
  BookOpen, 
  RefreshCcw, 
  Lock, 
  FileText, 
  Settings as SettingsIcon,
  Church,
  X
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/services', icon: Calendar, label: 'Services' },
  { to: '/cash-count', icon: Coins, label: 'Cash Count' },
  { to: '/cash-batches', icon: Package, label: 'Cash Batches' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/bank-ledger', icon: BookOpen, label: 'Bank Ledger' },
  { to: '/reconciliation', icon: RefreshCcw, label: 'Reconciliation' },
  { to: '/monthly-close', icon: Lock, label: 'Monthly Close' },
  { to: '/quarterly-report', icon: FileText, label: 'Quarterly Report' },
  { to: '/manual', icon: BookOpen, label: 'User Manual' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Church className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">JCIM Derby</h1>
            <p className="text-xs text-slate-500">Finance Desk</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-500 hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                : 'hover:bg-slate-800 hover:text-white'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 uppercase tracking-widest text-center">
        v1.0.0 MVP
      </div>
    </aside>
  );
}

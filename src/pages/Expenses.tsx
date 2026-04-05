/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Receipt, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { Expense } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => StorageService.getAll('expenses'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const settings = StorageService.getSettings();

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => 
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const expenseData: Expense = {
      id: editingExpense?.id || generateId(),
      date: formData.get('date') as string,
      dueDate: formData.get('dueDate') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      payee: formData.get('payee') as string,
      amount: Number(formData.get('amount')),
      paymentMethod: formData.get('paymentMethod') as any,
      source: formData.get('source') as any,
      status: formData.get('status') as any,
      notes: formData.get('notes') as string,
      serviceId: formData.get('serviceId') as string || undefined,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.save('expenses', expenseData);
    setExpenses(StorageService.getAll('expenses'));
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      StorageService.delete('expenses', id);
      setExpenses(StorageService.getAll('expenses'));
    }
  };

  const handleMarkAsPaid = (expense: Expense) => {
    const updated = { ...expense, status: 'paid' as const, updatedAt: new Date().toISOString() };
    StorageService.save('expenses', updated);
    setExpenses(StorageService.getAll('expenses'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses & Accounts Payable</h1>
          <p className="text-slate-500 text-sm">Track church spending and upcoming bills</p>
        </div>
        <button 
          onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Register Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Expenses List/Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile List View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredExpenses.map(expense => (
            <div key={expense.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{expense.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{expense.payee}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{formatDate(expense.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    {expense.category.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    expense.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    expense.status === 'due' ? 'bg-rose-100 text-rose-700' : 
                    expense.status === 'planned' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {expense.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {expense.status !== 'paid' && (
                    <button 
                      onClick={() => handleMarkAsPaid(expense)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => { setEditingExpense(expense); setIsModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div className="p-8 text-center text-slate-500 italic text-sm">
              No expenses found.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description / Payee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-slate-900">{expense.description}</p>
                    <p className="text-xs text-slate-500">{expense.payee}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      {expense.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      expense.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                      expense.status === 'due' ? 'bg-rose-100 text-rose-700' : 
                      expense.status === 'planned' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {expense.status !== 'paid' && (
                        <button 
                          onClick={() => handleMarkAsPaid(expense)}
                          className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => { setEditingExpense(expense); setIsModalOpen(true); }}
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900">{editingExpense ? 'Edit Expense' : 'Register Expense'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    required 
                    defaultValue={editingExpense?.date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    required 
                    defaultValue={editingExpense?.dueDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <input 
                  type="text" 
                  name="description" 
                  required 
                  placeholder="e.g. Monthly Rent"
                  defaultValue={editingExpense?.description || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payee</label>
                <input 
                  type="text" 
                  name="payee" 
                  required 
                  placeholder="e.g. Derby Council"
                  defaultValue={editingExpense?.payee || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select 
                    name="category" 
                    required 
                    defaultValue={editingExpense?.category || 'other'}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                  >
                    {settings.categories.filter(c => c.type === 'expense').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">£</span>
                    <input 
                      type="number" 
                      step="0.01"
                      name="amount" 
                      required 
                      defaultValue={editingExpense?.amount || ''}
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
                  <select 
                    name="paymentMethod" 
                    required 
                    defaultValue={editingExpense?.paymentMethod || 'bank_transfer'}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="direct_debit">Direct Debit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source</label>
                  <select 
                    name="source" 
                    required 
                    defaultValue={editingExpense?.source || 'bank'}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                  >
                    <option value="cash">Cash Box</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select 
                  name="status" 
                  required 
                  defaultValue={editingExpense?.status || 'planned'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                >
                  <option value="planned">Planned</option>
                  <option value="due">Due</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                <textarea 
                  name="notes" 
                  rows={2}
                  defaultValue={editingExpense?.notes || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-bold text-sm shadow-lg shadow-emerald-500/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

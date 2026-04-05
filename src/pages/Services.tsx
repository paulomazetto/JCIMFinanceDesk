/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { Service } from '../types';
import { formatDate, generateId } from '../utils';

export function Services() {
  const [services, setServices] = useState<Service[]>(() => StorageService.getAll('services'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    return services
      .filter(s => 
        s.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [services, searchTerm]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceData: Service = {
      id: editingService?.id || generateId(),
      date: formData.get('date') as string,
      type: formData.get('type') as string,
      location: formData.get('location') as string,
      notes: formData.get('notes') as string,
      status: (formData.get('status') as any) || 'draft',
      createdAt: editingService?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.save('services', serviceData);
    setServices(StorageService.getAll('services'));
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      StorageService.delete('services', id);
      setServices(StorageService.getAll('services'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Services & Events</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Manage church services and special events</p>
        </div>
        <button 
          onClick={() => { setEditingService(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all w-full sm:w-auto text-sm font-bold uppercase tracking-wider shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Service</span>
        </button>
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

      {/* Services List/Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile List View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredServices.map(service => (
            <div key={service.id} className="p-3 space-y-2 active:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-tight truncate">{service.type}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{formatDate(service.date)}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shrink-0 ${
                  service.status === 'closed' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                  service.status === 'finalized' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                  'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {service.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500 font-medium truncate">{service.location}</p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setEditingService(service); setIsModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-emerald-600 active:scale-90 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="p-2 -mr-2 text-slate-300 hover:text-rose-600 active:scale-90 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="p-8 text-center text-slate-500 italic text-sm">
              No services found.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map(service => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                    {formatDate(service.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {service.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {service.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      service.status === 'closed' ? 'bg-slate-100 text-slate-600' : 
                      service.status === 'finalized' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingService(service); setIsModalOpen(true); }}
                        className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No services found.
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
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900">{editingService ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  defaultValue={editingService?.date || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service Type</label>
                <select 
                  name="type" 
                  required 
                  defaultValue={editingService?.type || 'Sunday Service'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                >
                  {StorageService.getSettings().serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
                <input 
                  type="text" 
                  name="location" 
                  required 
                  defaultValue={editingService?.location || 'Derby Hall'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingService?.status || 'draft'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="finalized">Finalized</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  defaultValue={editingService?.notes || ''}
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

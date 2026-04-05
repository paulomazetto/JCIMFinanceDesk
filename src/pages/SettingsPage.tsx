/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Church, BookOpen, Building2, Database, Download, Upload, Trash2, Plus, Edit2, Save, History, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { Settings, AuditLog } from '../types';
import { formatDateTime } from '../utils';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => StorageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAll('audit_logs'));
  const [activeTab, setActiveTab] = useState('profile');

  const handleSaveSettings = () => {
    StorageService.saveSettings(settings);
    alert('Settings saved successfully!');
  };

  const handleExport = () => {
    const data = StorageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jcim_derby_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (window.confirm('This will overwrite all current data. Are you sure?')) {
        StorageService.importData(json);
        setSettings(StorageService.getSettings());
        setAuditLogs(StorageService.getAll('audit_logs'));
        alert('Data imported successfully!');
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('This will PERMANENTLY DELETE all data. Are you sure?')) {
      StorageService.resetDatabase();
      window.location.reload();
    }
  };

  const handleGenerateMock = () => {
    if (window.confirm('This will reset the database and generate demo data. Are you sure?')) {
      StorageService.generateMockData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm">Configure your church profile and manage data</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 sm:py-2 rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Navigation - Horizontal scroll on mobile */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={Church} label="Profile" />
          <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={BookOpen} label="Categories" />
          <TabButton active={activeTab === 'bank'} onClick={() => setActiveTab('bank')} icon={Building2} label="Bank" />
          <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={Database} label="Data" />
          <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={History} label="Audit" />
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] lg:min-h-[600px]">
            {activeTab === 'profile' && (
              <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6">Church Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Church Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                      value={settings.churchName}
                      onChange={(e) => setSettings({ ...settings, churchName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                      value={settings.branch}
                      onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Country</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                      value={settings.country}
                      onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Currency</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Categories</h3>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {settings.categories.map(cat => (
                    <div key={cat.id} className="py-4 flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-slate-900 text-sm sm:text-base">{cat.label}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500">Mapping: {cat.reportMapping} • Type: {cat.type}</p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Bank Accounts</h3>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.bankAccounts.map(acc => (
                    <div key={acc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-900 text-sm sm:text-base">{acc.label}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${acc.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                          {acc.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500">{acc.name} • {acc.mask}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-900">Data Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="bg-emerald-50 p-3 rounded-xl w-fit">
                      <Download className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Export Backup</h4>
                      <p className="text-xs sm:text-sm text-slate-500">Download all your data as a JSON file.</p>
                    </div>
                    <button 
                      onClick={handleExport}
                      className="w-full py-3 sm:py-2.5 rounded-xl sm:rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/10 active:scale-95"
                    >
                      Export JSON
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-xl w-fit">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Import Backup</h4>
                      <p className="text-xs sm:text-sm text-slate-500">Restore your data from a JSON file.</p>
                    </div>
                    <label className="block w-full py-3 sm:py-2.5 rounded-xl sm:rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors text-center cursor-pointer shadow-md shadow-blue-500/10 active:scale-95">
                      Import JSON
                      <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                    </label>
                  </div>
                </div>

                <div className="pt-6 sm:pt-8 border-t border-slate-100 space-y-4">
                  <h4 className="font-bold text-rose-600 flex items-center gap-2 text-sm sm:text-base">
                    <AlertCircle className="w-5 h-5" />
                    Danger Zone
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      onClick={handleGenerateMock}
                      className="w-full sm:flex-1 py-3 sm:py-2.5 rounded-xl sm:rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors active:scale-95"
                    >
                      Generate Demo Data
                    </button>
                    <button 
                      onClick={handleReset}
                      className="w-full sm:flex-1 py-3 sm:py-2.5 rounded-xl sm:rounded-lg bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reset Database
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6">Audit Log</h3>
                <div className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <div key={log.id} className="py-3 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{log.summary}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                          {log.entity} • {log.action}
                        </p>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono whitespace-nowrap">{formatDateTime(log.timestamp)}</span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="p-12 text-center text-slate-400 italic text-sm">No logs recorded yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 whitespace-nowrap lg:w-full ${
        active 
          ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20' 
          : 'text-slate-600 hover:bg-slate-100 bg-white lg:bg-transparent border border-slate-200 lg:border-none'
      }`}
    >
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
      <span className="text-xs sm:text-sm">{label}</span>
    </button>
  );
}

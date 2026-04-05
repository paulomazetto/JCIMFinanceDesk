/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { CashCountPage } from './pages/CashCountPage';
import { CashBatches } from './pages/CashBatches';
import { Expenses } from './pages/Expenses';
import { BankLedger } from './pages/BankLedger';
import { Reconciliation } from './pages/Reconciliation';
import { MonthlyClosePage } from './pages/MonthlyClosePage';
import { QuarterlyReport } from './pages/QuarterlyReport';
import { SettingsPage } from './pages/SettingsPage';
import { UserManual } from './pages/UserManual';
import { StorageService } from './services/StorageService';

export default function App() {
  useEffect(() => {
    // Initialize with mock data if empty
    const services = StorageService.getAll('services');
    if (services.length === 0) {
      StorageService.generateMockData();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="cash-count" element={<CashCountPage />} />
          <Route path="cash-batches" element={<CashBatches />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="bank-ledger" element={<BankLedger />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="monthly-close" element={<MonthlyClosePage />} />
          <Route path="quarterly-report" element={<QuarterlyReport />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="manual" element={<UserManual />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

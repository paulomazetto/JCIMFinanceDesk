/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const formatCurrency = (amount: number, currency = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const parseCSV = (csv: string) => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
};

export const generateId = () => crypto.randomUUID();

export const getMonthName = (month: number) => {
  return new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(new Date(2026, month - 1, 1));
};

export const getQuarter = (month: number) => {
  return Math.ceil(month / 3);
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-x-hidden flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden active:scale-95 transition-transform"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-slate-900 font-bold text-sm md:text-lg truncate tracking-tight">JCIM Derby Finance</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/manual" className="p-2 text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium hidden md:inline">Help</span>
            </Link>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Finance Team</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs md:text-base border border-emerald-200 shadow-sm">
                FT
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

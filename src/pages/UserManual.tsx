/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  LayoutDashboard, 
  Calendar, 
  Coins, 
  Package, 
  Receipt, 
  RefreshCcw, 
  Lock,
  CheckCircle2,
  Info,
  ArrowRight
} from 'lucide-react';

const steps = [
  {
    id: 'intro',
    title: 'Welcome to Finance Desk',
    description: 'This manual will guide you step-by-step on how to manage JCIM Derby finances simply and securely.',
    icon: BookOpen,
    color: 'bg-emerald-500',
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
          The system is designed to be intuitive, even for those with no accounting experience. 
          We have divided the process into logical steps that follow the real church workflow.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4" /> Income Flow
            </h4>
            <p className="text-xs sm:text-sm text-emerald-700">Service → Counting → Batch → Deposit</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4" /> Expense Flow
            </h4>
            <p className="text-xs sm:text-sm text-amber-700">Expense → Payment → Reconciliation</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'dashboard',
    title: '1. Dashboard',
    description: 'Your real-time financial overview.',
    icon: LayoutDashboard,
    color: 'bg-blue-500',
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base">In the Dashboard, you will find the main indicators:</p>
        <ul className="space-y-3">
          <li className="flex gap-3 items-start">
            <div className="mt-1 bg-blue-100 p-1 rounded-full shrink-0"><Info className="w-3 h-3 text-blue-600" /></div>
            <div>
              <span className="font-bold text-slate-900 text-sm sm:text-base">Consolidated Balance:</span> 
              <p className="text-xs sm:text-sm text-slate-500">Sum of everything in the bank and what is still on hand (physical cash).</p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <div className="mt-1 bg-blue-100 p-1 rounded-full shrink-0"><Info className="w-3 h-3 text-blue-600" /></div>
            <div>
              <span className="font-bold text-slate-900 text-sm sm:text-base">Trend Chart:</span> 
              <p className="text-xs sm:text-sm text-slate-500">Shows if income is higher than expenses over the months.</p>
            </div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'services',
    title: '2. Registering Services',
    description: 'Where it all starts: recording offerings.',
    icon: Calendar,
    color: 'bg-purple-500',
    content: (
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <ol className="space-y-4 list-decimal list-inside text-slate-700 text-sm sm:text-base">
            <li>Go to <span className="font-mono text-xs bg-slate-200 px-1 rounded">Services</span> in the sidebar.</li>
            <li>Click on <span className="font-bold text-emerald-600">+ New Service</span>.</li>
            <li>Fill in the date, service type (Sunday, Midweek, etc.), and total collected.</li>
            <li><span className="font-bold">Tip:</span> If there is physical cash, you will need to do a cash count next.</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    id: 'cash-count',
    title: '3. Cash Counting',
    description: 'Smart calculator to avoid errors.',
    icon: Coins,
    color: 'bg-amber-500',
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base">The <span className="font-bold">Cash Count</span> page helps count pound (£) notes and coins:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['£50', '£20', '£10', '£5', '£2', '£1', '50p', '...'].map(v => (
            <div key={v} className="text-center p-2 border border-dashed border-slate-300 rounded text-[10px] sm:text-xs text-slate-400">
              {v} x [ Qty ]
            </div>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 italic">The system calculates the total automatically as you enter quantities.</p>
      </div>
    )
  },
  {
    id: 'reconciliation',
    title: '4. Bank Reconciliation',
    description: 'Ensuring the system and the bank match.',
    icon: RefreshCcw,
    color: 'bg-indigo-500',
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base">This is the most important step for transparency:</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 bg-white shadow-sm border border-slate-200 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <p className="text-xs sm:text-sm">Import the bank statement (Bank Ledger).</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white shadow-sm border border-slate-200 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <p className="text-xs sm:text-sm">Go to Reconciliation.</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white shadow-sm border border-slate-200 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">3</div>
            <p className="text-xs sm:text-sm">Match transactions that correspond to internal records.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'close',
    title: '5. Monthly Closing',
    description: 'Locking data for the final report.',
    icon: Lock,
    color: 'bg-rose-500',
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
          <p className="text-rose-900 font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
            <Info className="w-4 h-4" /> Attention
          </p>
          <p className="text-xs sm:text-sm text-rose-700">
            After closing the month, no data from that period can be changed. 
            This ensures the integrity of reports sent to headquarters.
          </p>
        </div>
        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm sm:text-base">
          I understand! Go to Dashboard
        </button>
      </div>
    )
  }
];

export function UserManual() {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4">
      <header className="mb-8 sm:mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4"
        >
          <BookOpen className="w-3 h-3" /> User Guide
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 leading-tight">
          How to use <span className="text-emerald-600">Finance Desk</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-lg max-w-2xl mx-auto">
          An interactive guide to help you master our church's financial tools.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Navigation Dots */}
        <div className="lg:col-span-1 flex lg:flex-col gap-3 justify-center order-2 lg:order-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'bg-emerald-500 scale-125' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Main Content Card */}
        <div className="lg:col-span-11 order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className={`h-1.5 sm:h-2 ${step.color}`} />
              
              <div className="p-6 sm:p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${step.color} text-white shadow-lg`}>
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{step.title}</h2>
                    <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-lg">{step.description}</p>
                    
                    <div className="bg-slate-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100">
                      {step.content}
                    </div>
                  </div>
                </div>

                <div className="mt-8 sm:mt-12 flex items-center justify-between border-t border-slate-100 pt-6 sm:pt-8">
                  <button
                    onClick={prev}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                      currentStep === 0 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-600 hover:bg-slate-100 active:scale-95'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Prev
                  </button>

                  <div className="text-[10px] sm:text-sm font-medium text-slate-400">
                    Step {currentStep + 1} of {steps.length}
                  </div>

                  <button
                    onClick={next}
                    disabled={currentStep === steps.length - 1}
                    className={`flex items-center gap-1 sm:gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold transition-all shadow-lg text-sm sm:text-base ${
                      currentStep === steps.length - 1
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95'
                    }`}
                  >
                    {currentStep === steps.length - 1 ? 'End' : 'Next'} <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Quick Links */}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <Info className="w-4 h-4 text-emerald-500" /> Support
              </h4>
              <p className="text-xs sm:text-sm text-slate-500">Technical questions? Contact the system administrator.</p>
            </div>
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <RefreshCcw className="w-4 h-4 text-emerald-500" /> Backups
              </h4>
              <p className="text-xs sm:text-sm text-slate-500">The system automatically saves your data locally with every change.</p>
            </div>
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <ArrowRight className="w-4 h-4 text-emerald-500" /> Shortcuts
              </h4>
              <p className="text-xs sm:text-sm text-slate-500">Use the sidebar to quickly navigate between sections.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

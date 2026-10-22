import React from 'react';
import { AlertTriangle, Download, RefreshCw, FileText, Plus } from 'lucide-react';
import { MetricSummary } from '../types/fault';

interface HeaderProps {
  metrics: MetricSummary;
  activeView: 'dashboard' | 'ledger' | 'shift_handover';
  setActiveView: (view: 'dashboard' | 'ledger' | 'shift_handover') => void;
  onOpenLogModal: () => void;
  onExportCsv: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  activeView,
  setActiveView,
  onOpenLogModal,
  onExportCsv,
  onResetDemo
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                setActiveView('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
            >
              Fault Time Management System
            </a>
            {metrics.criticalActive > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                {metrics.criticalActive} Critical Active
              </span>
            )}
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap pb-1 ${
                activeView === 'dashboard'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'text-slate-600'
              }`}
            >
              Operations Console
            </button>
            <button
              onClick={() => setActiveView('ledger')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap pb-1 ${
                activeView === 'ledger'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'text-slate-600'
              }`}
            >
              Incident History
            </button>
            <button
              onClick={() => setActiveView('shift_handover')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap pb-1 flex items-center gap-1.5 ${
                activeView === 'shift_handover'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'text-slate-600'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              Shift Handover Report
            </button>
          </nav>

          {/* Zone 3: Primary Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onResetDemo}
              title="Reset to sample demonstration data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Reset demo sample data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onExportCsv}
              title="Download CSV report"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>

            <button
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Log Fault
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

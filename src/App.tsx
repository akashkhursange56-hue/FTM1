import { useState, useEffect, useMemo } from 'react';
import { FaultItem } from './types/fault';
import {
  getStoredFaults,
  saveFaultsToStorage,
  calculateMetrics,
  resetToDemoFaults,
  exportFaultsToCsv
} from './utils/faultStorage';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { LogFaultForm } from './components/LogFaultForm';
import { FaultsTable } from './components/FaultsTable';
import { ResolutionModal } from './components/ResolutionModal';
import { FaultDetailModal } from './components/FaultDetailModal';
import { ShiftHandoverView } from './components/ShiftHandoverView';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [faults, setFaults] = useState<FaultItem[]>(() => getStoredFaults());
  const [activeView, setActiveView] = useState<'dashboard' | 'ledger' | 'shift_handover'>('dashboard');
  
  // Modals state
  const [resolvingFault, setResolvingFault] = useState<FaultItem | null>(null);
  const [inspectingFault, setInspectingFault] = useState<FaultItem | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    saveFaultsToStorage(faults);
  }, [faults]);

  // Derived metrics
  const metrics = useMemo(() => calculateMetrics(faults), [faults]);

  // Show transient notification
  const showToast = (text: string, type: 'success' | 'info' | 'alert' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handlers
  const handleLogFault = (
    faultData: Omit<FaultItem, 'id' | 'reported_at' | 'acknowledged_at' | 'resolved_at' | 'root_cause' | 'action_taken'>
  ) => {
    const nextNumber = 1000 + faults.length + 1;
    const newFault: FaultItem = {
      ...faultData,
      id: `FLT-${nextNumber}`,
      reported_at: new Date().toISOString(),
      acknowledged_at: null,
      resolved_at: null,
      root_cause: '',
      action_taken: ''
    };

    setFaults((prev) => [newFault, ...prev]);
    setIsLogModalOpen(false);
    showToast(`Fault ${newFault.id} logged. Downtime clock started.`, 'alert');
  };

  const handleStartProgress = (id: string) => {
    setFaults((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            status: 'In Progress',
            acknowledged_at: f.acknowledged_at || new Date().toISOString()
          };
        }
        return f;
      })
    );
    showToast(`Status updated to In Progress for ${id}`, 'info');
  };

  const handleOpenResolveModal = (fault: FaultItem) => {
    setResolvingFault(fault);
  };

  const handleConfirmResolve = (data: {
    id: string;
    root_cause: string;
    action_taken: string;
    parts_replaced?: string;
    responder?: string;
  }) => {
    setFaults((prev) =>
      prev.map((f) => {
        if (f.id === data.id) {
          return {
            ...f,
            status: 'Resolved',
            resolved_at: new Date().toISOString(),
            root_cause: data.root_cause,
            action_taken: data.action_taken,
            parts_replaced: data.parts_replaced,
            responder: data.responder || f.responder
          };
        }
        return f;
      })
    );
    setResolvingFault(null);
    showToast(`Incident ${data.id} marked as Resolved. Downtime recorded.`, 'success');
  };

  const handleReopenFault = (id: string) => {
    setFaults((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            status: 'In Progress',
            resolved_at: null
          };
        }
        return f;
      })
    );
    showToast(`Fault ${id} reopened. Downtime clock resumed.`, 'alert');
  };

  const handleDeleteFault = (id: string) => {
    if (window.confirm(`Are you sure you want to delete incident ${id}?`)) {
      setFaults((prev) => prev.filter((f) => f.id !== id));
      showToast(`Record ${id} removed.`, 'info');
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset dashboard to fresh sample operational demonstration data?')) {
      const fresh = resetToDemoFaults();
      setFaults(fresh);
      showToast('Sample faults reset with live running stopwatches.', 'info');
    }
  };

  const handleExportCsv = () => {
    exportFaultsToCsv(faults);
    showToast('Exporting faults ledger to CSV...', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900">
      {/* Top Bar Header */}
      <Header
        metrics={metrics}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onExportCsv={handleExportCsv}
        onResetDemo={handleResetDemo}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`mb-4 p-3.5 rounded-lg flex items-center justify-between text-xs font-semibold shadow-xs transition-all ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : toastMessage.type === 'alert'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-slate-800 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              {toastMessage.type === 'alert' && <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* View Routing */}
        {activeView === 'shift_handover' ? (
          <ShiftHandoverView
            faults={faults}
            metrics={metrics}
            onBackToConsole={() => setActiveView('dashboard')}
          />
        ) : (
          <>
            {/* Primary Metrics Row */}
            <MetricsCards metrics={metrics} />

            {/* Layout Split: Left Form (320px) + Right Table (1fr) as requested */}
            {activeView === 'dashboard' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Form: 4 of 12 columns (~320-360px) */}
                <div className="lg:col-span-4 sticky top-20">
                  <LogFaultForm onLogFault={handleLogFault} />
                </div>

                {/* Right Table: 8 of 12 columns */}
                <div className="lg:col-span-8">
                  <FaultsTable
                    faults={faults}
                    onStartProgress={handleStartProgress}
                    onRequestResolve={handleOpenResolveModal}
                    onViewDetails={(f) => setInspectingFault(f)}
                    onDeleteFault={handleDeleteFault}
                    onReopenFault={handleReopenFault}
                  />
                </div>
              </div>
            ) : (
              /* Full width incident ledger */
              <div className="space-y-4">
                <FaultsTable
                  faults={faults}
                  onStartProgress={handleStartProgress}
                  onRequestResolve={handleOpenResolveModal}
                  onViewDetails={(f) => setInspectingFault(f)}
                  onDeleteFault={handleDeleteFault}
                  onReopenFault={handleReopenFault}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Resolution Modal */}
      {resolvingFault && (
        <ResolutionModal
          fault={resolvingFault}
          onClose={() => setResolvingFault(null)}
          onConfirmResolve={handleConfirmResolve}
        />
      )}

      {/* Detail / Lifecycle Modal */}
      {inspectingFault && (
        <FaultDetailModal
          fault={inspectingFault}
          onClose={() => setInspectingFault(null)}
          onRequestResolve={handleOpenResolveModal}
        />
      )}

      {/* Quick Log Modal for Header / Mobile */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full relative">
            <button
              onClick={() => setIsLogModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-2">
              <LogFaultForm onLogFault={handleLogFault} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

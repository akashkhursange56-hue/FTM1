import React, { useState } from 'react';
import { FaultItem } from '../types/fault';
import { CheckCircle2, X } from 'lucide-react';

interface ResolutionModalProps {
  fault: FaultItem | null;
  onClose: () => void;
  onConfirmResolve: (data: {
    id: string;
    root_cause: string;
    action_taken: string;
    parts_replaced?: string;
    responder?: string;
  }) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  fault,
  onClose,
  onConfirmResolve
}) => {
  if (!fault) return null;

  const [rootCause, setRootCause] = useState(fault.root_cause || '');
  const [actionTaken, setActionTaken] = useState(fault.action_taken || '');
  const [partsReplaced, setPartsReplaced] = useState(fault.parts_replaced || '');
  const [responder, setResponder] = useState(
    fault.responder && fault.responder !== 'Unassigned' ? fault.responder : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCause.trim() || !actionTaken.trim()) return;

    onConfirmResolve({
      id: fault.id,
      root_cause: rootCause.trim(),
      action_taken: actionTaken.trim(),
      parts_replaced: partsReplaced.trim(),
      responder: responder.trim() || fault.responder || 'Shift Tech'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Resolve Fault & Stop Downtime Clock</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {fault.id} · {fault.asset}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-slate-900">Issue: </span>
            {fault.title}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Root Cause Identification <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="e.g., Solenoid coil burnout due to 24V line voltage surge"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Corrective Action Taken <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="e.g., Replaced valve assembly, flushed hydraulic pilot line, and reset breaker"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Parts Replaced (Optional)
              </label>
              <input
                type="text"
                value={partsReplaced}
                onChange={(e) => setPartsReplaced(e.target.value)}
                placeholder="e.g., Parker D1VW Solenoid"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Resolving Technician
              </label>
              <input
                type="text"
                value={responder}
                onChange={(e) => setResponder(e.target.value)}
                placeholder="e.g., Carlos Mendez"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Resolution & Stop Clock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

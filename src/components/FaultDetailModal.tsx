import React from 'react';
import { FaultItem } from '../types/fault';
import { formatDuration } from '../utils/faultStorage';
import { X, Clock, AlertTriangle, ShieldCheck, User, Wrench, FileText } from 'lucide-react';

interface FaultDetailModalProps {
  fault: FaultItem | null;
  onClose: () => void;
  onRequestResolve?: (fault: FaultItem) => void;
}

export const FaultDetailModal: React.FC<FaultDetailModalProps> = ({
  fault,
  onClose,
  onRequestResolve
}) => {
  if (!fault) return null;

  const startTime = new Date(fault.reported_at).getTime();
  const endTime = fault.resolved_at ? new Date(fault.resolved_at).getTime() : Date.now();
  const diffMs = Math.max(0, endTime - startTime);
  const durationStr = formatDuration(diffMs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
              {fault.id}
            </span>
            <h3 className="text-base font-bold text-slate-900">{fault.asset}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Main Title & Status Bar */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 leading-snug">{fault.title}</h4>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Category: {fault.category}</span>
              <span>·</span>
              <span className="font-medium text-slate-700">Severity: {fault.severity}</span>
              <span>·</span>
              <span
                className={`font-semibold ${
                  fault.status === 'Resolved'
                    ? 'text-emerald-600'
                    : fault.status === 'In Progress'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                Status: {fault.status}
              </span>
            </div>
          </div>

          {/* Downtime Metric Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                {fault.status === 'Resolved' ? 'Total Downtime Duration' : 'Active Elapsed Downtime'}
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {durationStr}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{Math.round(diffMs / 60000)} minutes total</span>
            </div>
          </div>

          {/* Lifecycle Timestamps */}
          <div className="space-y-2 text-xs border border-slate-100 rounded-lg p-3.5 bg-white">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Reported Timestamp:</span>
              <span className="font-mono text-slate-800">
                {new Date(fault.reported_at).toLocaleString()}
              </span>
            </div>
            {fault.acknowledged_at && (
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium text-slate-500">Progress Started:</span>
                <span className="font-mono text-slate-800">
                  {new Date(fault.acknowledged_at).toLocaleString()}
                </span>
              </div>
            )}
            {fault.resolved_at && (
              <div className="flex items-center justify-between text-emerald-700">
                <span className="font-medium">Resolved Timestamp:</span>
                <span className="font-mono font-semibold">
                  {new Date(fault.resolved_at).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-medium text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Responder / Tech:
              </span>
              <span className="font-medium text-slate-800">{fault.responder || 'Unassigned'}</span>
            </div>
          </div>

          {/* Initial Notes */}
          {fault.notes && (
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Initial Symptoms & Observations
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200">
                {fault.notes}
              </div>
            </div>
          )}

          {/* Resolution Details */}
          {fault.status === 'Resolved' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <div className="text-xs font-semibold uppercase text-emerald-700 tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Root Cause Analysis
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-lg text-xs text-slate-800 border border-emerald-100">
                  {fault.root_cause || 'No root cause recorded.'}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-500" />
                  Corrective Action Implemented
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-800 border border-slate-200">
                  {fault.action_taken || 'No action notes recorded.'}
                </div>
              </div>

              {fault.parts_replaced && (
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Components Replaced: </span>
                  {fault.parts_replaced}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          {fault.status !== 'Resolved' && onRequestResolve && (
            <button
              onClick={() => {
                onClose();
                onRequestResolve(fault);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Resolve Fault
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

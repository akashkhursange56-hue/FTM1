import React, { useState } from 'react';
import { FaultItem, MetricSummary } from '../types/fault';
import { formatMinutesHuman } from '../utils/faultStorage';
import { Copy, Check, Printer, ArrowLeft } from 'lucide-react';

interface ShiftHandoverViewProps {
  faults: FaultItem[];
  metrics: MetricSummary;
  onBackToConsole: () => void;
}

export const ShiftHandoverView: React.FC<ShiftHandoverViewProps> = ({
  faults,
  metrics,
  onBackToConsole
}) => {
  const [copied, setCopied] = useState(false);

  const activeFaults = faults.filter((f) => f.status !== 'Resolved');
  const resolvedFaults = faults.filter((f) => f.status === 'Resolved');

  const shiftDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const generateReportText = () => {
    let text = `========================================\n`;
    text += `OPERATIONAL SHIFT HANDOVER REPORT\n`;
    text += `Date: ${shiftDate}\n`;
    text += `Fleet Availability: ${metrics.availabilityPercent}%\n`;
    text += `MTTR (Avg Resolution): ${metrics.mttrMinutes} min\n`;
    text += `Active Faults: ${metrics.active} | Resolved: ${metrics.resolved}\n`;
    text += `========================================\n\n`;

    text += `[1] ACTIVE FAULTS PENDING ATTENTION (${activeFaults.length}):\n`;
    if (activeFaults.length === 0) {
      text += `  None. All systems nominal.\n`;
    } else {
      activeFaults.forEach((f, idx) => {
        text += `  ${idx + 1}. [${f.severity.toUpperCase()}] ${f.asset} - ${f.title}\n`;
        text += `     Status: ${f.status} | Tech: ${f.responder || 'Unassigned'}\n`;
        if (f.notes) text += `     Notes: ${f.notes}\n`;
        text += `\n`;
      });
    }

    text += `\n[2] FAULTS RESOLVED THIS SHIFT (${resolvedFaults.length}):\n`;
    if (resolvedFaults.length === 0) {
      text += `  No faults closed.\n`;
    } else {
      resolvedFaults.forEach((f, idx) => {
        text += `  ${idx + 1}. ${f.asset} - ${f.title}\n`;
        text += `     Root Cause: ${f.root_cause || 'N/A'}\n`;
        text += `     Action Taken: ${f.action_taken || 'N/A'}\n`;
        if (f.parts_replaced) text += `     Parts Replaced: ${f.parts_replaced}\n`;
        text += `\n`;
      });
    }

    text += `\nReport generated via Fault Time Management System.`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={onBackToConsole}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Operations Console
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied Report</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Shift Document Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto">
        <div className="border-b border-slate-200 pb-5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-xl font-bold text-slate-900">Operational Shift Handover Dossier</h1>
            <span className="text-xs text-slate-500 font-medium">{shiftDate}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official handover documentation for incoming shift lead, maintenance supervisors, and reliability engineering.
          </p>
        </div>

        {/* Shift Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
          <div>
            <div className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              Fleet Availability
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {metrics.availabilityPercent}%
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              Average MTTR
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {metrics.mttrMinutes} min
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              Active Handover Items
            </div>
            <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">
              {metrics.active}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              Downtime Incurred
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {formatMinutesHuman(metrics.totalDowntimeMinutes)}
            </div>
          </div>
        </div>

        {/* Section 1: Active Items */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>1. Open & In-Progress Faults ({activeFaults.length})</span>
            <span className="text-xs font-normal text-rose-600">Requires Immediate Handover Focus</span>
          </h2>

          {activeFaults.length === 0 ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              Zero active faults at shift handover. All lines running nominal.
            </div>
          ) : (
            <div className="space-y-3">
              {activeFaults.map((f) => (
                <div key={f.id} className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">
                          {f.id}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm">{f.asset}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-rose-600">{f.severity}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 mt-1">{f.title}</div>
                      {f.notes && (
                        <div className="text-xs text-slate-500 mt-1.5 bg-slate-50 p-2 rounded">
                          {f.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {f.status}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">Tech: {f.responder}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Closed items */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            2. Resolved Faults & Interventions Completed ({resolvedFaults.length})
          </h2>

          <div className="space-y-3">
            {resolvedFaults.map((f) => (
              <div key={f.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-slate-500">{f.id}</span>
                      <span className="font-semibold text-slate-900 text-sm">{f.asset}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-600">{f.title}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">Root Cause: </span>
                        <span className="text-slate-600">{f.root_cause || 'None logged'}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">Action: </span>
                        <span className="text-slate-600">{f.action_taken || 'None logged'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

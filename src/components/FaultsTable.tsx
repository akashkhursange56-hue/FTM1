import React, { useState, useEffect } from 'react';
import { FaultItem, FaultSeverity, FaultStatus } from '../types/fault';
import { formatDuration } from '../utils/faultStorage';
import { Play, CheckCircle, Search, Info, Trash2, RotateCcw } from 'lucide-react';

interface FaultsTableProps {
  faults: FaultItem[];
  onStartProgress: (id: string) => void;
  onRequestResolve: (fault: FaultItem) => void;
  onViewDetails: (fault: FaultItem) => void;
  onDeleteFault: (id: string) => void;
  onReopenFault: (id: string) => void;
}

export const FaultsTable: React.FC<FaultsTableProps> = ({
  faults,
  onStartProgress,
  onRequestResolve,
  onViewDetails,
  onDeleteFault,
  onReopenFault
}) => {
  // Live clock state to drive 1-second interval recalculation
  const [now, setNow] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [severityFilter, setSeverityFilter] = useState<'All' | FaultSeverity>('All');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter faults
  const filteredFaults = faults.filter((f) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        f.title.toLowerCase().includes(q) ||
        f.asset.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.responder.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter === 'Active') {
      if (f.status === 'Resolved') return false;
    } else if (statusFilter !== 'All') {
      if (f.status !== statusFilter) return false;
    }

    // Severity filter
    if (severityFilter !== 'All') {
      if (f.severity !== severityFilter) return false;
    }

    return true;
  });

  const getSeverityBadgeClass = (severity: FaultSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusBadgeClass = (status: FaultStatus) => {
    switch (status) {
      case 'Open':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'In Progress':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Resolved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Active & Recent Faults</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredFaults.length} of {faults.length} total logged incidents
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
          {(['All', 'Active', 'In Progress', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by asset, fault name, ID, or technician..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/70">
              <th className="py-3 px-3">Asset / Location</th>
              <th className="py-3 px-3">Fault Issue</th>
              <th className="py-3 px-3">Severity</th>
              <th className="py-3 px-3">Downtime Duration</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredFaults.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto">
                    <p className="text-sm font-medium text-slate-700">No faults match your filter</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Adjust your search or status filters to view records.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredFaults.map((fault) => {
                const startTime = new Date(fault.reported_at).getTime();
                const endTime = fault.resolved_at ? new Date(fault.resolved_at).getTime() : now;
                const diffMs = Math.max(0, endTime - startTime);
                const timerString = formatDuration(diffMs);

                const isResolved = fault.status === 'Resolved';
                const isCritical = fault.severity === 'Critical';

                return (
                  <tr
                    key={fault.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !isResolved && isCritical ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Asset & ID */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {fault.asset}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{fault.id}</span>
                        <span>·</span>
                        <span>{fault.category}</span>
                      </div>
                    </td>

                    {/* Fault Name */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="font-medium text-slate-800 line-clamp-2 text-xs sm:text-sm">
                        {fault.title}
                      </div>
                      {fault.responder && fault.responder !== 'Unassigned' && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Assigned: <span className="text-slate-700">{fault.responder}</span>
                        </div>
                      )}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityBadgeClass(
                          fault.severity
                        )}`}
                      >
                        {fault.severity}
                      </span>
                    </td>

                    {/* Downtime Duration (Live Timer) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-sm font-bold tabular-nums ${
                            isResolved
                              ? 'text-slate-600'
                              : isCritical
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {timerString}
                        </span>
                        {!isResolved && (
                          <span className="inline-block w-2 h-2 rounded-full bg-rose-500" title="Active Downtime Clock Running" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isResolved ? 'Total down' : 'Elapsed'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusBadgeClass(
                          fault.status
                        )}`}
                      >
                        {fault.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {fault.status === 'Open' && (
                          <button
                            type="button"
                            onClick={() => onStartProgress(fault.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Start Progress</span>
                          </button>
                        )}

                        {fault.status === 'In Progress' && (
                          <button
                            type="button"
                            onClick={() => onRequestResolve(fault)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Mark Resolved</span>
                          </button>
                        )}

                        {fault.status === 'Resolved' && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-emerald-700 mr-1">
                              Closed
                            </span>
                            <button
                              type="button"
                              onClick={() => onReopenFault(fault.id)}
                              title="Reopen incident"
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => onViewDetails(fault)}
                          title="View Details & Diagnostics"
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteFault(fault.id)}
                          title="Delete incident"
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

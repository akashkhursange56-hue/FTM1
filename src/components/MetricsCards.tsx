import React from 'react';
import { MetricSummary } from '../types/fault';
import { Clock, Activity, AlertOctagon, CheckCircle2, Gauge } from 'lucide-react';
import { formatMinutesHuman } from '../utils/faultStorage';

interface MetricsCardsProps {
  metrics: MetricSummary;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Faults */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Faults</span>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.total}
          </span>
          <span className="text-xs text-slate-500">
            {metrics.resolved} resolved
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>{metrics.open} Open</span>
          <span>·</span>
          <span>{metrics.inProgress} In Progress</span>
        </div>
      </div>

      {/* 2. Active Faults */}
      <div className={`bg-white rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-sm ${
        metrics.active > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Active Faults</span>
          <AlertOctagon className={`w-4 h-4 ${metrics.criticalActive > 0 ? 'text-rose-500' : 'text-amber-500'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold font-mono tabular-nums ${
            metrics.criticalActive > 0 ? 'text-rose-600' : metrics.active > 0 ? 'text-amber-600' : 'text-slate-900'
          }`}>
            {metrics.active}
          </span>
          {metrics.criticalActive > 0 && (
            <span className="text-xs font-medium text-rose-600">
              ({metrics.criticalActive} critical)
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {metrics.active === 0 ? 'All lines nominal' : 'Clock running on active issues'}
        </div>
      </div>

      {/* 3. Avg Resolution Time (MTTR) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Resolution Time (MTTR)</span>
          <Clock className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.mttrMinutes}
          </span>
          <span className="text-sm font-medium text-slate-600">min</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Calculated across {metrics.resolved} closed faults</span>
        </div>
      </div>

      {/* 4. Fleet Availability & Total Downtime */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Availability & Downtime</span>
          <Gauge className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.availabilityPercent}%
          </span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            ({formatMinutesHuman(metrics.totalDowntimeMinutes)} total)
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Target standard: ≥ 98.5% uptime
        </div>
      </div>
    </div>
  );
};

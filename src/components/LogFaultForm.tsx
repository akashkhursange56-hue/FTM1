import React, { useState } from 'react';
import { FaultSeverity, FaultCategory, FaultItem } from '../types/fault';
import { Play, Sparkles } from 'lucide-react';

interface LogFaultFormProps {
  onLogFault: (fault: Omit<FaultItem, 'id' | 'reported_at' | 'acknowledged_at' | 'resolved_at' | 'root_cause' | 'action_taken'>) => void;
  compact?: boolean;
}

const PRESETS = [
  { title: 'Drive Inverter Overcurrent Trip', asset: 'Assembly Line 01 / Bay 2', category: 'Electrical' as FaultCategory, severity: 'Critical' as FaultSeverity },
  { title: 'PLC Communication Timeout', asset: 'Main Distribution Rack 3', category: 'Network' as FaultCategory, severity: 'High' as FaultSeverity },
  { title: 'Conveyor Sensor Photocell Jam', asset: 'Palletizer Cell B', category: 'Software' as FaultCategory, severity: 'Medium' as FaultSeverity },
  { title: 'Hydraulic Actuator Pressure Drop', asset: 'Stamping Station 3', category: 'Hydraulics' as FaultCategory, severity: 'High' as FaultSeverity },
];

export const LogFaultForm: React.FC<LogFaultFormProps> = ({ onLogFault, compact = false }) => {
  const [title, setTitle] = useState('');
  const [asset, setAsset] = useState('');
  const [severity, setSeverity] = useState<FaultSeverity>('Medium');
  const [category, setCategory] = useState<FaultCategory>('Mechanical');
  const [responder, setResponder] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !asset.trim()) return;

    onLogFault({
      title: title.trim(),
      asset: asset.trim(),
      severity,
      category,
      status: 'Open',
      responder: responder.trim() || 'Unassigned',
      notes: notes.trim()
    });

    // Reset form
    setTitle('');
    setAsset('');
    setSeverity('Medium');
    setCategory('Mechanical');
    setResponder('');
    setNotes('');
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setAsset(preset.asset);
    setCategory(preset.category);
    setSeverity(preset.severity);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Log New Fault</h2>
          <p className="text-xs text-slate-500 mt-0.5">Initiates real-time downtime stopwatch immediately</p>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Incident Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors text-left"
            >
              {p.title.split(' ')[0]} {p.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Fault Name / Issue <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Network Switch Unreachable"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label htmlFor="asset" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Asset / Location <span className="text-rose-500">*</span>
          </label>
          <input
            id="asset"
            type="text"
            required
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            placeholder="e.g., Rack 4 / Server Room"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="severity" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Severity
            </label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as FaultSeverity)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="Low">Low (Informational)</option>
              <option value="Medium">Medium (Degraded)</option>
              <option value="High">High (Subsystem Down)</option>
              <option value="Critical">Critical (Total Halt)</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as FaultCategory)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Network">Network</option>
              <option value="Software">Software</option>
              <option value="Hydraulics">Hydraulics</option>
              <option value="HVAC & Power">HVAC & Power</option>
              <option value="Safety">Safety</option>
            </select>
          </div>
        </div>

        {!compact && (
          <>
            <div>
              <label htmlFor="responder" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Responder / Technician (Optional)
              </label>
              <input
                id="responder"
                type="text"
                value={responder}
                onChange={(e) => setResponder(e.target.value)}
                placeholder="e.g., Alex Chen or leave blank"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Observations / Symptoms (Optional)
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observed error codes, sounds, or alarm light sequence..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Log Fault & Start Clock</span>
        </button>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { Terminal, Search, Clock, Server, Info, AlertTriangle } from 'lucide-react';
import { ScalingLog } from '../types';

interface ScalingLogsTableProps {
  logs: ScalingLog[];
}

export const ScalingLogsTable: React.FC<ScalingLogsTableProps> = ({ logs }) => {
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      log.action_taken.toLowerCase().includes(term) ||
      (log.node_name && log.node_name.toLowerCase().includes(term)) ||
      log.id.toString().includes(term)
    );
  });

  const getSeverityConfig = (action: string) => {
    const txt = action.toLowerCase();
    if (txt.includes('critical') || txt.includes('failed') || txt.includes('spike') || txt.includes('violation')) {
      return {
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/35',
        label: 'CRITICAL'
      };
    }
    if (txt.includes('warning') || txt.includes('high workload') || txt.includes('exceeded')) {
      return {
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/35',
        label: 'WARNING'
      };
    }
    if (txt.includes('provision') || txt.includes('scale-up') || txt.includes('scale up') || txt.includes('initialized')) {
      return {
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/35',
        label: 'SCALE_UP'
      };
    }
    if (txt.includes('decommission') || txt.includes('scale-down') || txt.includes('scale down') || txt.includes('removed')) {
      return {
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/35',
        label: 'SCALE_DN'
      };
    }
    return {
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      label: 'OPTIMAL'
    };
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 flex flex-col gap-4 w-full shadow-2xl">
      {/* Table Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-cyan-400">
            <Terminal className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase">Real-Time Scaling Activity Logs</h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">MySQL System Audit Trails & Orchestration Events</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Filter operations by node, region or actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
      </div>

      {/* Standard HTML Table Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-900 bg-[#050811]">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400 font-extrabold tracking-wider">
              <th className="py-3 px-4 w-24">Log ID</th>
              <th className="py-3 px-4 w-44">Target Host / Cluster</th>
              <th className="py-3 px-4">Scaling Operations details</th>
              <th className="py-3 px-4 w-32">Severity</th>
              <th className="py-3 px-4 w-48">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                  No operational records found. Waiting for system auto-scaling changes...
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const config = getSeverityConfig(log.action_taken);
                
                return (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-900/30 transition-colors duration-200 group"
                  >
                    {/* Log ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                      #{1000 + log.id}
                    </td>

                    {/* Node Cluster */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5 text-slate-350 font-bold font-mono">
                        <Server className="w-3.5 h-3.5 text-slate-550 shrink-0" />
                        {log.node_name || `cluster-node-${log.node_id}`}
                      </span>
                    </td>

                    {/* Action message */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      <span className="flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                        {log.action_taken}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded border font-extrabold tracking-widest leading-none ${config.badgeClass}`}>
                        {config.label}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5 text-slate-450 font-mono text-2xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer statistics */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-2xs text-slate-500 font-bold tracking-widest pt-2">
        <span>DYNAMIC REFRESH ACTIVE • POLLING: 8000MS</span>
        <span>AUDITED INSTANCE LOGS: {logs.length} REGISTERED</span>
      </div>
    </div>
  );
};

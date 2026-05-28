import React from 'react';
import { Server, ShieldCheck, Database, RefreshCw, Cpu, TrendingUp, AlertTriangle } from 'lucide-react';
import { CloudNode } from '../types';

interface DashboardHeaderProps {
  nodes: CloudNode[];
  datasource: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  nodes,
  datasource,
  isRefreshing,
  onRefresh,
}) => {
  // Compute key metrics
  const totalNodes = nodes.length;
  const avgLoad = totalNodes > 0 
    ? Math.round(nodes.reduce((sum, n) => sum + n.current_load, 0) / totalNodes) 
    : 0;

  const statusCounts = nodes.reduce(
    (acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    },
    { active: 0, warning: 0, critical: 0, scaling: 0 } as Record<string, number>
  );

  const activeCount = statusCounts.active + statusCounts.scaling;
  const criticalWarningCount = statusCounts.warning + statusCounts.critical;

  // FinOps dynamic efficiency score: higher when nodes load averages between 40-75%
  // Extreme low loads (<25%) mean overallocation (waste). Extreme high loads (>85%) mean performance risks.
  const calculateEfficiency = () => {
    if (totalNodes === 0) return 100;
    let scorePenalty = 0;
    nodes.forEach(node => {
      if (node.current_load < 30) {
        // Under-provisioned waste penalty
        scorePenalty += (30 - node.current_load) * 0.8;
      } else if (node.current_load > 80) {
        // Performance reliability risk penalty
        scorePenalty += (node.current_load - 80) * 1.2;
      }
    });
    return Math.max(30, Math.round(100 - (scorePenalty / totalNodes)));
  };

  const efficiencyScore = calculateEfficiency();

  return (
    <header className="flex flex-col gap-6 w-full">
      {/* Upper row: Branding and system health */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl shadow-glow-cyan">
              <Server className="w-6 h-6 text-white" />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                FinOps Global Cloud Asset Optimizer
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                Autonomous FinOps dynamic resource allocator & regional workload stabilizer.
              </p>
            </div>
          </div>
        </div>

        {/* Diagnostic Connection Badges & Refresher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass-panel border ${
            datasource === 'mysql-live' 
              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' 
              : 'border-amber-500/30 text-amber-400 bg-amber-950/20'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>DB Status: {datasource === 'mysql-live' ? 'MySQL Live' : 'Simulated Sandbox'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass-panel border border-cyan-500/20 text-cyan-400 bg-cyan-950/20 pulse-glow-cyan">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Agent Active</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 transition-all text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Dynamic Key metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Avg Utilization */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-violet-500/30 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average CPU Load</span>
            <span className="text-3xl font-extrabold text-white tracking-tight">{avgLoad}%</span>
            <span className="text-xs text-slate-500">Across all provisioned host clusters</span>
          </div>
          <div className="p-3.5 bg-violet-950/30 rounded-xl border border-violet-800/30 text-violet-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Active Instances */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Instances</span>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {activeCount} <span className="text-xs text-slate-500 font-medium">/ {totalNodes} total</span>
            </span>
            <span className="text-xs text-slate-500">{statusCounts.scaling || 0} currently undergoing auto-scale</span>
          </div>
          <div className="p-3.5 bg-cyan-950/30 rounded-xl border border-cyan-800/30 text-cyan-400">
            <Server className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Health Alert Counts */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-rose-500/30 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hotspots Detected</span>
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {criticalWarningCount}
            </span>
            <span className="text-xs text-slate-500">
              {statusCounts.critical || 0} Critical ({'>'}90%), {statusCounts.warning || 0} Warning ({'>'}75%)
            </span>
          </div>
          <div className={`p-3.5 rounded-xl border ${
            criticalWarningCount > 0 
              ? 'bg-rose-950/30 border-rose-800/30 text-rose-400' 
              : 'bg-emerald-950/20 border-emerald-800/20 text-emerald-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: FinOps Score */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">FinOps Cost Score</span>
            <span className="text-3xl font-extrabold text-white tracking-tight">{efficiencyScore}%</span>
            <span className="text-xs text-slate-500">Optimizing sizing vs waste factor</span>
          </div>
          <div className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-800/30 text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

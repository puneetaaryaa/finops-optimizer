import React from 'react';
import { BarChart3, Coins, PieChart, ShieldAlert } from 'lucide-react';
import { CloudNode } from '../types';

interface MetricsChartsProps {
  nodes: CloudNode[];
}

export const MetricsCharts: React.FC<MetricsChartsProps> = ({ nodes }) => {
  const regions = ['Mumbai', 'US-East', 'Europe'];

  // Calculate workloads by region
  const regionMetrics = regions.map(reg => {
    const regNodes = nodes.filter(n => n.region === reg);
    const totalLoad = regNodes.reduce((sum, n) => sum + n.current_load, 0);
    const avgLoad = regNodes.length > 0 ? Math.round(totalLoad / regNodes.length) : 0;
    
    // FinOps Cost Allocation Estimate:
    // Simulated billing based on node status and load
    // Active Node = $0.20/hr, Overloaded Warning/Critical Node = $0.35/hr, Scaling Node = $0.50/hr
    const hourlyCost = regNodes.reduce((cost, n) => {
      if (n.status === 'scaling') return cost + 0.50;
      if (n.status === 'critical') return cost + 0.35;
      if (n.status === 'warning') return cost + 0.28;
      return cost + 0.20;
    }, 0);

    return {
      region: reg,
      avgLoad,
      nodeCount: regNodes.length,
      cost: parseFloat(hourlyCost.toFixed(2))
    };
  });

  const totalMonthlySavingEst = nodes.reduce((savings, n) => {
    // If optimized (load between 40% and 70%), we accumulate virtual FinOps savings!
    if (n.current_load >= 35 && n.current_load <= 70) {
      return savings + 45; // $45/month saved per optimized node
    }
    return savings;
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
      {/* Chart Card 1: Regional Workload Stabilizer */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">Load Comparison Index</h3>
            <p className="text-3xs text-slate-500 font-semibold tracking-wider">AVERAGE COMPUTE METRIC BY ZONE</p>
          </div>
        </div>

        <div className="flex flex-col gap-4.5 pt-2">
          {regionMetrics.map(metric => (
            <div key={metric.region} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 font-mono uppercase">{metric.region}</span>
                <span className="text-slate-400 font-semibold">
                  {metric.avgLoad}% load avg <span className="text-slate-650 text-2xs">({metric.nodeCount} nodes)</span>
                </span>
              </div>

              {/* Progress bar representational graph */}
              <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-900 overflow-hidden flex">
                <div 
                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                    metric.avgLoad >= 90 
                      ? 'from-rose-600 to-rose-400 shadow-glow-rose' 
                      : metric.avgLoad >= 75 
                      ? 'from-amber-600 to-amber-400' 
                      : 'from-violet-600 to-cyan-400'
                  }`}
                  style={{ width: `${metric.avgLoad}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Card 2: FinOps Cost Stabilizer metrics */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3">
          <Coins className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">FinOps Ledger Summary</h3>
            <p className="text-3xs text-slate-500 font-semibold tracking-wider">DYNAMIC RUNTIME HOSTING COST ESTIMATES</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Section A: Costs by Region */}
          <div className="flex flex-col gap-3">
            <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Estimated Hourly Bill</span>
            <div className="flex flex-col gap-2">
              {regionMetrics.map(metric => (
                <div key={metric.region} className="flex items-center justify-between text-xs">
                  <span className="text-slate-450 font-semibold font-mono text-2xs uppercase">{metric.region}</span>
                  <span className="text-slate-200 font-extrabold">${metric.cost.toFixed(2)}/hr</span>
                </div>
              ))}
              <div className="border-t border-slate-900 pt-1.5 flex items-center justify-between text-xs font-bold text-white">
                <span>Total Est:</span>
                <span className="text-emerald-400">
                  ${regionMetrics.reduce((sum, m) => sum + m.cost, 0).toFixed(2)}/hr
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Dynamic FinOps Analytics */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-900 p-3.5 flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs font-extrabold text-cyan-400 uppercase tracking-widest">FinOps Optimization</span>
              <h4 className="text-xl font-black text-white">${totalMonthlySavingEst}</h4>
              <p className="text-3xs text-slate-400 font-medium">Est. Monthly Savings realized via container consolidation & scaling.</p>
            </div>
            
            <div className="border-t border-slate-900/80 pt-2 flex items-center gap-1.5 text-3xs font-extrabold text-slate-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Resource Stabilizer Enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

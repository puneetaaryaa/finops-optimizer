import React from 'react';
import { Globe, HardDrive, CheckCircle2 } from 'lucide-react';
import { CloudNode, RegionFilter } from '../types';

interface RegionOverviewProps {
  nodes: CloudNode[];
  activeFilter: RegionFilter;
  onFilterChange: (region: RegionFilter) => void;
}

export const RegionOverview: React.FC<RegionOverviewProps> = ({
  nodes,
  activeFilter,
  onFilterChange,
}) => {
  const regions: { key: RegionFilter; name: string; geo: string }[] = [
    { key: 'Mumbai', name: 'Mumbai (ap-south-1)', geo: 'Maharashtra, India' },
    { key: 'US-East', name: 'US East (N. Virginia)', geo: 'Virginia, USA' },
    { key: 'Europe', name: 'Europe Central (Frankfurt)', geo: 'Frankfurt, Germany' },
  ];

  const getRegionStats = (regionKey: string) => {
    const regionNodes = nodes.filter(n => n.region === regionKey);
    const count = regionNodes.length;
    const avgLoad = count > 0 
      ? Math.round(regionNodes.reduce((sum, n) => sum + n.current_load, 0) / count) 
      : 0;
    
    // Status color code
    let statusColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (regionNodes.some(n => n.status === 'critical')) {
      statusColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    } else if (regionNodes.some(n => n.status === 'warning')) {
      statusColor = 'text-amber-400 border-amber-500/20 bg-amber-550/5';
    }

    return { count, avgLoad, statusColor };
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Globe className="w-4 h-4 text-violet-400" />
          Regional Cloud Assets
        </h2>
        <button
          onClick={() => onFilterChange('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
            activeFilter === 'ALL' 
              ? 'bg-violet-600/20 border-violet-500/40 text-violet-400 shadow-glow-purple' 
              : 'border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          Show All Regions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {regions.map((reg) => {
          const { count, avgLoad, statusColor } = getRegionStats(reg.key);
          const isSelected = activeFilter === reg.key;

          return (
            <div
              key={reg.key}
              onClick={() => onFilterChange(reg.key)}
              className={`glass-panel p-4.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-3 group relative overflow-hidden ${
                isSelected 
                  ? 'border-violet-500 bg-violet-950/10 shadow-glow-purple scale-[1.01]' 
                  : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              {/* Inner glowing top accent border when selected */}
              {isSelected && (
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 to-cyan-400" />
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">
                    {reg.name}
                  </h3>
                  <span className="text-2xs text-slate-500 font-medium">{reg.geo}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${statusColor}`}>
                  {count > 0 ? `${avgLoad}% Load` : 'Empty'}
                </span>
              </div>

              {/* Dynamic stats */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-slate-900/60">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  <strong>{count}</strong> Node{count !== 1 && 's'}
                </span>
                {count > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          avgLoad >= 90 ? 'bg-rose-500' : avgLoad >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${avgLoad}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-600 italic">Unprovisioned</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Server, Activity, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Plus, Trash2, ShieldAlert, Sparkles, Compass } from 'lucide-react';
import { CloudNode, ScalingAction } from '../types';

interface NodeGridProps {
  nodes: CloudNode[];
  activeRegion: string;
  onScale: (nodeId: number, action: ScalingAction) => void;
  onProvision: (name: string, region: string, load: number) => void;
  onDecommission: (nodeId: number) => void;
  isLoading: boolean;
}

export const NodeGrid: React.FC<NodeGridProps> = ({
  nodes,
  activeRegion,
  onScale,
  onProvision,
  onDecommission,
  isLoading,
}) => {
  // Filter logic
  const filteredNodes = activeRegion === 'ALL' 
    ? nodes 
    : nodes.filter(n => n.region === activeRegion);

  // Form states for provisioning
  const [showForm, setShowForm] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newRegion, setNewRegion] = useState('us-east-1');
  const [newLoad, setNewLoad] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    onProvision(newNodeName, newRegion, newLoad);
    setNewNodeName('');
    setShowForm(false);
  };

  const getStatusConfig = (status: string, load: number) => {
    if (load >= 90 || status === 'critical') {
      return {
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-glow-rose',
        text: 'CRITICAL OVERLOAD',
        accentColor: 'from-rose-600 to-rose-400',
        cardBorder: 'hover:border-rose-500/50',
        textColor: 'text-rose-400',
        indicator: 'bg-rose-500'
      };
    }
    if (load >= 75 || status === 'warning') {
      return {
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        text: 'WORKLOAD WARNING',
        accentColor: 'from-amber-600 to-amber-400',
        cardBorder: 'hover:border-amber-500/50',
        textColor: 'text-amber-400',
        indicator: 'bg-amber-500'
      };
    }
    if (status === 'scaling') {
      return {
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse',
        text: 'AUTO SCALING',
        accentColor: 'from-cyan-600 to-cyan-400',
        cardBorder: 'hover:border-cyan-500/50',
        textColor: 'text-cyan-400',
        indicator: 'bg-cyan-400'
      };
    }
    return {
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      text: 'OPTIMAL HEALTH',
      accentColor: 'from-emerald-600 to-emerald-400',
      cardBorder: 'hover:border-violet-500/30',
      textColor: 'text-emerald-400',
      indicator: 'bg-emerald-500'
    };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header controls inside Grid section */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white">
            Active Compute Node Instances
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {filteredNodes.length} Clusters
            </span>
          </h2>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-glow-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          Provision Host Node
        </button>
      </div>

      {/* Provisioning form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-slate-950/70 shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fadeIn duration-200">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field 1: Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Cluster/Node Name</label>
              <input
                type="text"
                required
                placeholder="e.g., node-us-east-1d"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            {/* Field 2: Region */}
            <div className="flex flex-col gap-1.5">
              <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Region Target</label>
              <select
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="Mumbai">Mumbai (ap-south-1)</option>
                <option value="US-East">US East (N. Virginia)</option>
                <option value="Europe">Europe Central (Frankfurt)</option>
              </select>
            </div>
            {/* Field 3: Load Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Initial Workload Load</label>
                <span className="text-xs font-bold text-cyan-400">{newLoad}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={newLoad}
                onChange={(e) => setNewLoad(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-900 text-xs font-bold text-slate-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
            >
              Deploy Cluster
            </button>
          </div>
        </form>
      )}

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNodes.length === 0 ? (
          <div className="col-span-full py-16 glass-panel rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center text-center gap-3">
            <ShieldAlert className="w-12 h-12 text-slate-600 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-slate-300">No Instances provisioned in region</p>
              <p className="text-xs text-slate-500">Deploy a cluster node to begin cloud dynamic balancing.</p>
            </div>
          </div>
        ) : (
          filteredNodes.map((node) => {
            const config = getStatusConfig(node.status, node.current_load);
            
            return (
              <div
                key={node.id}
                className={`glass-panel p-5 rounded-2xl border border-slate-800/80 transition-all duration-300 flex flex-col gap-4 group relative ${config.cardBorder}`}
              >
                {/* Upper row: Instance details */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition-colors`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white group-hover:text-violet-400 transition-colors">
                        {node.node_name}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3 h-3 text-slate-500" />
                        <span className="text-2xs text-slate-500 font-bold uppercase tracking-wider">{node.region}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded-md border font-extrabold tracking-wider ${config.badgeClass}`}>
                    {config.text}
                  </span>
                </div>

                {/* Center row: Workload indicators */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-900/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Activity className="w-3.5 h-3.5 text-slate-500" />
                      Workload Stress
                    </span>
                    <strong className={`font-bold ${config.textColor}`}>{node.current_load}% CPU</strong>
                  </div>

                  {/* Gradient Load Slider */}
                  <div className="w-full h-2 bg-slate-900 border border-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${config.accentColor} transition-all duration-500`}
                      style={{ width: `${node.current_load}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Row: Manual Optimization and Autoscaling Triggers */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-900/60">
                  <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">FinOps Dynamic Controls</span>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Scale UP */}
                    <button
                      onClick={() => onScale(node.id, 'scale_up')}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-2xs font-extrabold bg-slate-900 border border-slate-850 hover:border-violet-500/40 hover:bg-violet-950/15 text-slate-300 hover:text-violet-400 transition-all disabled:opacity-50"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      Scale Up
                    </button>

                    {/* Scale DOWN */}
                    <button
                      onClick={() => onScale(node.id, 'scale_down')}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-2xs font-extrabold bg-slate-900 border border-slate-850 hover:border-cyan-500/40 hover:bg-cyan-950/15 text-slate-300 hover:text-cyan-400 transition-all disabled:opacity-50"
                    >
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                      Scale Down
                    </button>

                    {/* Traffic SPIKE */}
                    <button
                      onClick={() => onScale(node.id, 'traffic_spike')}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-2xs font-extrabold bg-slate-900 border border-slate-850 hover:border-rose-500/40 hover:bg-rose-950/15 text-slate-400 hover:text-rose-300 transition-all disabled:opacity-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Traffic Spike
                    </button>

                    {/* Dynamic Optimization */}
                    <button
                      onClick={() => onScale(node.id, 'optimize')}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-2xs font-extrabold bg-slate-900 border border-slate-850 hover:border-emerald-500/40 hover:bg-emerald-950/15 text-slate-300 hover:text-emerald-400 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Optimize Size
                    </button>
                  </div>
                </div>

                {/* Decommission Button */}
                <button
                  onClick={() => onDecommission(node.id)}
                  disabled={isLoading}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-md hover:bg-rose-950/30 hover:border hover:border-rose-500/20 text-slate-600 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 duration-200"
                  title="Decommission Node"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

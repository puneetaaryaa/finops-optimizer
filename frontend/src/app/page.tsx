'use client';

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { RegionOverview } from '../components/RegionOverview';
import { NodeGrid } from '../components/NodeGrid';
import { ScalingLogsTable } from '../components/ScalingLogsTable';
import { MetricsCharts } from '../components/MetricsCharts';
import { CloudNode, ScalingLog, RegionFilter, ScalingAction } from '../types';
import { ShieldCheck, RefreshCw, AlertCircle, DatabaseZap } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

export default function Home() {
  const [nodes, setNodes] = useState<CloudNode[]>([]);
  const [logs, setLogs] = useState<ScalingLog[]>([]);
  const [datasource, setDatasource] = useState<string>('simulated-fallback');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('ALL');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Fallback local client data for sandbox testing if the backend server is not running
  const mockNodes: CloudNode[] = [
    { id: 1, node_name: 'cluster-us-east-a (Sandbox)', region: 'US-East', status: 'active', current_load: 45 },
    { id: 2, node_name: 'cluster-us-east-b (Sandbox)', region: 'US-East', status: 'active', current_load: 72 },
    { id: 3, node_name: 'cluster-us-east-c (Sandbox)', region: 'US-East', status: 'scaling', current_load: 92 },
    { id: 4, node_name: 'cluster-europe-a (Sandbox)', region: 'Europe', status: 'active', current_load: 60 },
    { id: 5, node_name: 'cluster-europe-b (Sandbox)', region: 'Europe', status: 'warning', current_load: 85 },
    { id: 6, node_name: 'cluster-mumbai-a (Sandbox)', region: 'Mumbai', status: 'active', current_load: 22 },
    { id: 7, node_name: 'cluster-mumbai-b (Sandbox)', region: 'Mumbai', status: 'active', current_load: 40 }
  ];

  const mockLogs: ScalingLog[] = [
    { id: 1, node_id: 1, node_name: 'cluster-us-east-a (Sandbox)', action_taken: 'Sandbox Instance Online: Initialized cluster-us-east-a.', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: 2, node_id: 2, node_name: 'cluster-us-east-b (Sandbox)', action_taken: 'Sandbox Instance Online: Initialized cluster-us-east-b.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 3, node_id: 3, node_name: 'cluster-us-east-c (Sandbox)', action_taken: 'High Workload Alert: Node cluster-us-east-c spiked to 92%. Dynamic replicas deployed.', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: 4, node_id: 4, node_name: 'cluster-europe-a (Sandbox)', action_taken: 'FinOps Optimization: Auto Scale-Down consolidated Europe clusters.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ];

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch nodes
      const nodeRes = await fetch(`${BACKEND_URL}/api/nodes`);
      const nodeData = await nodeRes.json();
      
      if (nodeData.success) {
        setNodes(nodeData.nodes);
        setDatasource(nodeData.datasource);
        setApiOnline(true);
      }

      // 2. Fetch logs
      const logRes = await fetch(`${BACKEND_URL}/api/logs`);
      const logData = await logRes.json();
      if (logData.success) {
        setLogs(logData.logs);
      }
    } catch (error) {
      console.warn('⚠️ Backend API offline. Activating Next.js local Sandbox sandbox dashboard.');
      setApiOnline(false);
      setNodes(mockNodes);
      setLogs(mockLogs);
      setDatasource('simulated-fallback');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh stats every 8 seconds for real-time cloud feeling
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleScaleAction = async (nodeId: number, action: ScalingAction) => {
    setIsLoading(true);
    
    // Optimistic local state update for blazing-fast micro-animations
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      let newL = n.current_load;
      let newStat = n.status;
      
      if (action === 'scale_up') {
        newL = Math.min(100, n.current_load + 20);
        newStat = newL >= 90 ? 'critical' : newL >= 75 ? 'warning' : 'active';
      } else if (action === 'scale_down') {
        newL = Math.max(0, n.current_load - 20);
        newStat = newL >= 90 ? 'critical' : newL >= 75 ? 'warning' : 'active';
      } else if (action === 'traffic_spike') {
        newL = 95;
        newStat = 'critical';
      } else if (action === 'optimize') {
        newL = 40;
        newStat = 'active';
      }
      return { ...n, current_load: newL, status: newStat };
    }));

    // Local audit log stream update
    const targetNode = nodes.find(n => n.id === nodeId);
    const newLog: ScalingLog = {
      id: logs.length + 1,
      node_id: nodeId,
      node_name: targetNode?.node_name || `Node #${nodeId}`,
      action_taken: `Scaling Control Request: Executing ${action.toUpperCase()} action on cluster node.`,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/nodes/${nodeId}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data = await res.json();
      if (data.success) {
        // Sync back real database values
        fetchData();
      }
    } catch (error) {
      console.warn('API error during scaling. Working in standalone Sandbox state.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvisionAction = async (name: string, region: string, load: number) => {
    setIsLoading(true);
    
    // Add optimistic node for Sandbox
    const tempId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 1;
    const tempNode: CloudNode = {
      id: tempId,
      node_name: `${name} (Sandbox)`,
      region,
      status: load >= 90 ? 'critical' : load >= 75 ? 'warning' : 'active',
      current_load: load
    };
    setNodes(prev => [...prev, tempNode]);

    const tempLog: ScalingLog = {
      id: logs.length + 1,
      node_id: tempId,
      node_name: name,
      action_taken: `Cluster Provisioning: Spinning up container slot inside zone ${region}.`,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [tempLog, ...prev]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_name: name, region, current_load: load })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.warn('API error during provision. Working in standalone Sandbox state.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecommissionAction = async (nodeId: number) => {
    setIsLoading(true);
    
    const targetNode = nodes.find(n => n.id === nodeId);
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    
    const tempLog: ScalingLog = {
      id: logs.length + 1,
      node_id: nodeId,
      node_name: targetNode?.node_name,
      action_taken: `Cluster Decommission: Tearing down compute clusters and releasing IP leases.`,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [tempLog, ...prev]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/nodes/${nodeId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.warn('API error during decommission. Working in standalone Sandbox state.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn duration-500">
      {/* Backend API Connection Alert Banner */}
      {apiOnline === false && (
        <div className="glass-panel border-amber-500/20 bg-amber-950/10 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-amber-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>
              <strong>Backend Offline:</strong> Next.js could not establish a pipeline to the Express API at <code>http://localhost:5000</code>.
              Running dashboard in fully interactive, local **Sandbox Sandbox** mode.
            </p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold border border-amber-500/20 transition-all shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Link
          </button>
        </div>
      )}

      {/* Main Dynamic Header */}
      <DashboardHeader 
        nodes={nodes} 
        datasource={datasource} 
        isRefreshing={isRefreshing} 
        onRefresh={fetchData} 
      />

      {/* Dynamic regional summaries */}
      <RegionOverview 
        nodes={nodes} 
        activeFilter={regionFilter} 
        onFilterChange={setRegionFilter} 
      />

      {/* Middle Grid and Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
        {/* Computing grid (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <NodeGrid 
            nodes={nodes}
            activeRegion={regionFilter}
            onScale={handleScaleAction}
            onProvision={handleProvisionAction}
            onDecommission={handleDecommissionAction}
            isLoading={isLoading}
          />
        </div>

        {/* Specs and Charts columns (Span 1) */}
        <div className="flex flex-col gap-6 w-full">
          {/* Dynamic Technical Specifications details widget */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-3 text-xs bg-gradient-to-br from-slate-950/70 to-slate-900/60 shadow-lg">
            <span className="text-3xs font-extrabold tracking-widest text-slate-500 uppercase">Engine Orchestrator Specs</span>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Cluster Technology:</span>
                <span className="font-semibold text-white">Docker Core K8s Cluster (Simulated)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Dynamic Scaling Type:</span>
                <span className="font-semibold text-cyan-400">Horizontal Pod Autoscaler (HPA)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Optimization Ruleset:</span>
                <span className="font-semibold text-violet-400">FinOps Cost Threshold v1.4</span>
              </div>
            </div>
            
            <div className="border-t border-slate-900/80 pt-2.5 flex items-center justify-between text-slate-500 text-3xs font-extrabold tracking-wider">
              <span>ACTIVE SCHEMA: v1.0.2</span>
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/40">
                <DatabaseZap className="w-3 h-3" />
                DOCKER DISPATCH OK
              </span>
            </div>
          </div>
          
          <MetricsCharts nodes={nodes} />
        </div>
      </div>

      {/* Full-width Scaling Logs Standard HTML Table (Below the node cards) */}
      <div className="w-full mt-2">
        <ScalingLogsTable logs={logs} />
      </div>
    </div>
  );
}

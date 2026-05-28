export interface CloudNode {
  id: number;
  node_name: string;
  region: string;
  status: string; // 'active' | 'warning' | 'critical' | 'scaling'
  current_load: number;
}

export interface ScalingLog {
  id: number;
  node_id: number;
  node_name?: string;
  action_taken: string;
  timestamp: string;
}

export type ScalingAction = 'scale_up' | 'scale_down' | 'traffic_spike' | 'optimize';
export type RegionFilter = 'ALL' | 'US-East' | 'Europe' | 'Mumbai';

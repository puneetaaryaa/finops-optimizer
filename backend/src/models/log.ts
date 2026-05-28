import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface ScalingLog {
  id: number;
  node_id: number;
  node_name?: string; // Loaded via JOIN
  action_taken: string;
  timestamp: string;
}

// In-memory fallback logs
let simulatedLogs: ScalingLog[] = [
  { id: 1, node_id: 1, node_name: 'cluster-us-east-a (Simulated)', action_taken: 'Initialized node cluster-us-east-a in region US-East.', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 2, node_id: 2, node_name: 'cluster-us-east-b (Simulated)', action_taken: 'Initialized node cluster-us-east-b in region US-East.', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 3, node_id: 3, node_name: 'cluster-us-east-c (Simulated)', action_taken: 'Scale Up triggered: CPU load exceeded 90% (currently 92%). Adding replica capacity in US-East.', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 4, node_id: 4, node_name: 'cluster-europe-a (Simulated)', action_taken: 'Scale Down triggered: CPU load fell below 40% (currently 60%). Deallocated micro-instance in Europe.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 5, node_id: 5, node_name: 'cluster-europe-b (Simulated)', action_taken: 'Resource Warning: High workload detected (85% utilization). System in auto-scale queue in Europe.', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
];

export const LogModel = {
  async getAll(limit: number = 50): Promise<{ logs: ScalingLog[]; isFallback: boolean }> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT l.id, l.node_id, n.node_name, l.action_taken, l.timestamp 
         FROM scaling_logs l 
         LEFT JOIN cloud_nodes n ON l.node_id = n.id 
         ORDER BY l.timestamp DESC LIMIT ?`,
        [limit]
      );
      return { logs: rows as ScalingLog[], isFallback: false };
    } catch (error) {
      // Sort in-memory fallback logs descending by timestamp
      const sorted = [...simulatedLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return { logs: sorted.slice(0, limit), isFallback: true };
    }
  },

  async create(node_id: number, action_taken: string, node_name?: string): Promise<number | null> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO scaling_logs (node_id, action_taken) VALUES (?, ?)',
        [node_id, action_taken]
      );
      return result.insertId;
    } catch (error) {
      const newId = simulatedLogs.length > 0 ? Math.max(...simulatedLogs.map(l => l.id)) + 1 : 1;
      const newLog: ScalingLog = {
        id: newId,
        node_id,
        node_name: node_name || `Node #${node_id}`,
        action_taken,
        timestamp: new Date().toISOString()
      };
      simulatedLogs.push(newLog);
      return newId;
    }
  }
};

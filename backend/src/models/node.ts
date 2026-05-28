import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface CloudNode {
  id: number;
  node_name: string;
  region: string;
  status: string;
  current_load: number;
}

// In-memory fallback dataset for seamless trial if MySQL isn't connected
let simulatedNodes: CloudNode[] = [
  { id: 1, node_name: 'cluster-us-east-a (Simulated)', region: 'US-East', status: 'active', current_load: 45 },
  { id: 2, node_name: 'cluster-us-east-b (Simulated)', region: 'US-East', status: 'active', current_load: 72 },
  { id: 3, node_name: 'cluster-us-east-c (Simulated)', region: 'US-East', status: 'scaling', current_load: 92 },
  { id: 4, node_name: 'cluster-europe-a (Simulated)', region: 'Europe', status: 'active', current_load: 60 },
  { id: 5, node_name: 'cluster-europe-b (Simulated)', region: 'Europe', status: 'warning', current_load: 85 },
  { id: 6, node_name: 'cluster-mumbai-a (Simulated)', region: 'Mumbai', status: 'active', current_load: 22 },
  { id: 7, node_name: 'cluster-mumbai-b (Simulated)', region: 'Mumbai', status: 'active', current_load: 40 }
];

export const NodeModel = {
  async getAll(): Promise<{ nodes: CloudNode[]; isFallback: boolean }> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM cloud_nodes');
      return { nodes: rows as CloudNode[], isFallback: false };
    } catch (error) {
      console.warn('⚠️ MySQL connection failed or cloud_nodes table missing. Serving simulated nodes.');
      return { nodes: simulatedNodes, isFallback: true };
    }
  },

  async getById(id: number): Promise<{ node: CloudNode | null; isFallback: boolean }> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM cloud_nodes WHERE id = ?', [id]);
      if (rows.length === 0) return { node: null, isFallback: false };
      return { node: rows[0] as CloudNode, isFallback: false };
    } catch (error) {
      const node = simulatedNodes.find(n => n.id === id) || null;
      return { node, isFallback: true };
    }
  },

  async updateLoadAndStatus(id: number, current_load: number, status: string): Promise<boolean> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'UPDATE cloud_nodes SET current_load = ?, status = ? WHERE id = ?',
        [current_load, status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      const nodeIndex = simulatedNodes.findIndex(n => n.id === id);
      if (nodeIndex !== -1) {
        simulatedNodes[nodeIndex] = { ...simulatedNodes[nodeIndex], current_load, status };
        return true;
      }
      return false;
    }
  },

  async create(node_name: string, region: string, status: string = 'active', current_load: number = 0): Promise<number | null> {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO cloud_nodes (node_name, region, status, current_load) VALUES (?, ?, ?, ?)',
        [node_name, region, status, current_load]
      );
      return result.insertId;
    } catch (error) {
      const newId = simulatedNodes.length > 0 ? Math.max(...simulatedNodes.map(n => n.id)) + 1 : 1;
      const newNode: CloudNode = { id: newId, node_name: `${node_name} (Simulated)`, region, status, current_load };
      simulatedNodes.push(newNode);
      return newId;
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await pool.query<ResultSetHeader>('DELETE FROM cloud_nodes WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      const nodeIndex = simulatedNodes.findIndex(n => n.id === id);
      if (nodeIndex !== -1) {
        simulatedNodes.splice(nodeIndex, 1);
        return true;
      }
      return false;
    }
  }
};

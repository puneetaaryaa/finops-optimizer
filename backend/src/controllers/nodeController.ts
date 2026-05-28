import { Request, Response } from 'express';
import { NodeModel } from '../models/node';
import { LogModel } from '../models/log';

export const getNodes = async (req: Request, res: Response) => {
  try {
    const { nodes, isFallback } = await NodeModel.getAll();
    res.json({
      success: true,
      datasource: isFallback ? 'simulated-fallback' : 'mysql-live',
      nodes
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNode = async (req: Request, res: Response) => {
  try {
    const { node_name, region, current_load } = req.body;
    if (!node_name || !region) {
      return res.status(400).json({ success: false, error: 'node_name and region are required.' });
    }

    const load = parseInt(current_load || '0');
    let status = 'active';
    if (load >= 90) status = 'critical';
    else if (load >= 80) status = 'warning';

    const insertId = await NodeModel.create(node_name, region, status, load);
    
    if (insertId) {
      // Record this scaling action logs
      await LogModel.create(insertId, `Node ${node_name} provisioned in region ${region} with default load ${load}%.`, node_name);
      
      res.status(201).json({
        success: true,
        message: 'Node provisioned successfully.',
        nodeId: insertId
      });
    } else {
      res.status(500).json({ success: false, error: 'Could not create node.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNode = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { node: existing } = await NodeModel.getById(id);
    
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Node not found.' });
    }

    const success = await NodeModel.delete(id);
    if (success) {
      // Record a log entry (we can use dummy ID since it is deleted, or map log to it)
      await LogModel.create(id, `Node ${existing.node_name} was decommissioned and removed from service.`, existing.node_name);
      
      res.json({ success: true, message: 'Node decommissioned successfully.' });
    } else {
      res.status(500).json({ success: false, error: 'Could not decommission node.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const scaleNode = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { action } = req.body; // 'scale_up', 'scale_down', 'traffic_spike', 'optimize'

    if (!['scale_up', 'scale_down', 'traffic_spike', 'optimize'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid scaling action.' });
    }

    const { node, isFallback } = await NodeModel.getById(id);
    if (!node) {
      return res.status(404).json({ success: false, error: 'Node not found.' });
    }

    let newLoad = node.current_load;
    let newStatus = node.status;
    let actionLog = '';

    switch (action) {
      case 'scale_up':
        newLoad = Math.min(100, node.current_load + 20);
        newStatus = newLoad >= 90 ? 'critical' : newLoad >= 75 ? 'warning' : 'active';
        actionLog = `Manual Scale-Up: Added CPU cores / Memory to ${node.node_name}. Load capacity changed from ${node.current_load}% to ${newLoad}%.`;
        break;

      case 'scale_down':
        newLoad = Math.max(0, node.current_load - 20);
        newStatus = newLoad >= 90 ? 'critical' : newLoad >= 75 ? 'warning' : 'active';
        actionLog = `Manual Scale-Down: Consolidated container instances on ${node.node_name}. Load capacity changed from ${node.current_load}% to ${newLoad}%.`;
        break;

      case 'traffic_spike':
        newLoad = 95;
        newStatus = 'critical';
        actionLog = `Simulated Traffic Spike: Sent 50k requests/sec to ${node.node_name}. Load spiked to ${newLoad}%. Automated scale triggers scheduled.`;
        break;

      case 'optimize':
        newLoad = 40;
        newStatus = 'active';
        actionLog = `Resource Optimization: Dynamic FinOps balancing applied to ${node.node_name}. Resetting load to optimized ${newLoad}% state.`;
        break;
    }

    const success = await NodeModel.updateLoadAndStatus(id, newLoad, newStatus);
    if (success) {
      await LogModel.create(id, actionLog, node.node_name);
      res.json({
        success: true,
        message: 'Scaling action completed successfully.',
        updatedNode: { ...node, current_load: newLoad, status: newStatus }
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update node load.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

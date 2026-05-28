import { NodeModel } from '../models/node';
import { LogModel } from '../models/log';

export const startLiveTrafficSimulation = () => {
  console.log('⚡ Dynamic Workload Simulation Engine initialized [Interval: 5s].');

  setInterval(async () => {
    try {
      const { nodes } = await NodeModel.getAll();
      if (!nodes || nodes.length === 0) return;

      // Select 1 to 3 random nodes to simulate traffic updates for in this interval
      const shuffle = [...nodes].sort(() => 0.5 - Math.random());
      const selectedNodes = shuffle.slice(0, Math.floor(Math.random() * 3) + 1);

      for (const node of selectedNodes) {
        // Random change factor: -15% to +15%
        const delta = Math.floor(Math.random() * 31) - 15;
        const newLoad = Math.max(0, Math.min(100, node.current_load + delta));
        
        let newStatus = node.status;
        if (newStatus !== 'scaling') {
          if (newLoad >= 90) newStatus = 'critical';
          else if (newLoad >= 75) newStatus = 'warning';
          else newStatus = 'active';
        }

        // Only commit if load actually shifted
        if (newLoad !== node.current_load) {
          await NodeModel.updateLoadAndStatus(node.id, newLoad, newStatus);

          // Write dynamic audit alerts if severity status crosses thresholds
          if (node.status === 'active' && newStatus === 'warning') {
            await LogModel.create(
              node.id, 
              `Workload Spike Warning: Workload load increased on ${node.node_name} to warning threshold (${newLoad}%).`, 
              node.node_name
            );
          } else if (newStatus === 'critical' && node.status !== 'critical') {
            await LogModel.create(
              node.id, 
              `Critical Workload Alert: Node ${node.node_name} spiked to critical load (${newLoad}%). High SLA violation risk.`, 
              node.node_name
            );
          } else if (newStatus === 'active' && (node.status === 'warning' || node.status === 'critical')) {
            await LogModel.create(
              node.id, 
              `SLA Stabilized: Node ${node.node_name} CPU utilization recovered to safe parameters (${newLoad}%).`, 
              node.node_name
            );
          }
        }
      }
    } catch (error: any) {
      console.error('⚠️ Simulator encountered error running interval loop: ', error.message);
    }
  }, 5000);
};

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodeRoutes from './routes/nodeRoutes';
import logRoutes from './routes/logRoutes';
import { verifyDatabaseConnection } from './config/db';
import { startLiveTrafficSimulation } from './utils/simulator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json());

// Main API Endpoints
app.use('/api/nodes', nodeRoutes);
app.use('/api/logs', logRoutes);

// Healthcheck / welcome route
app.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to FinOps Multi-Region Cloud Asset Optimizer API',
    version: '1.0.0',
    endpoints: {
      nodes: '/api/nodes',
      logs: '/api/logs'
    }
  });
});

// Run server and verify database link
const startServer = async () => {
  await verifyDatabaseConnection();
  
  // Initialize dynamic workload simulator
  startLiveTrafficSimulation();
  
  app.listen(PORT, () => {
    console.log(`🚀 Optimizer Backend listening on http://localhost:${PORT}`);
  });
};

startServer();

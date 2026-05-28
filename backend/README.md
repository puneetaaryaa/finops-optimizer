# Multi-Region Cloud Asset Optimizer Backend

Express.js & TypeScript backend that interacts with a MySQL database to monitor, manage, and scale simulated cloud infrastructure instances across multiple regions.

## Features
- **Auto-Fallback Engine**: Runs out-of-the-box in simulated mock mode if MySQL is not yet configured or reachable. No hard crashes!
- **Resource Management API**: Endpoints to fetch active cloud nodes, dynamically scale capacity up/down, delete nodes, and simulate workloads.
- **FinOps Log Streaming**: Audits and stores history of all autoscaling and dynamic resource allocation events.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Database Settings (Optional)**:
   Rename or update your `.env` settings to match your MySQL database server details:
   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=cloud_optimizer
   ```

3. **Database Schema Setup (Optional)**:
   Import the script located under `../database/schema.sql` to your MySQL instance.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The API server will run at `http://localhost:5000`.

## API Documentation

- `GET /` - Root endpoint showing API status & metadata.
- `GET /api/nodes` - Retrieves all instances, their regional group, status, and load metric.
- `POST /api/nodes` - Provisions a new node in a specified region.
- `DELETE /api/nodes/:id` - Decommissions a node.
- `POST /api/nodes/:id/scale` - Executes scaling operations on a node.
  - Required JSON Body: `{ "action": "scale_up" | "scale_down" | "traffic_spike" | "optimize" }`
- `GET /api/logs` - Retrieves standard operational event logs.

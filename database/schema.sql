-- Multi-Region Cloud Asset Optimizer Database Schema
-- Database: cloud_optimizer

CREATE DATABASE IF NOT EXISTS cloud_optimizer;
USE cloud_optimizer;

-- 1. Create cloud_nodes table
CREATE TABLE IF NOT EXISTS cloud_nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- e.g., 'active', 'warning', 'critical', 'scaling'
    current_load INT NOT NULL DEFAULT 0 CHECK (current_load >= 0 AND current_load <= 100)
);

-- 2. Create scaling_logs table
CREATE TABLE IF NOT EXISTS scaling_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_id INT NOT NULL,
    action_taken VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (node_id) REFERENCES cloud_nodes(id) ON DELETE CASCADE
);

-- 3. Seed initial mock data
INSERT INTO cloud_nodes (node_name, region, status, current_load) VALUES
('node-us-east-1a', 'us-east-1', 'active', 45),
('node-us-east-1b', 'us-east-1', 'active', 72),
('node-us-east-1c', 'us-east-1', 'scaling', 92),
('node-us-west-2a', 'us-west-2', 'active', 30),
('node-us-west-2b', 'us-west-2', 'active', 15),
('node-eu-west-1a', 'eu-west-1', 'active', 60),
('node-eu-west-1b', 'eu-west-1', 'warning', 85),
('node-ap-southeast-1a', 'ap-southeast-1', 'active', 22),
('node-ap-southeast-1b', 'ap-southeast-1', 'active', 40)
ON DUPLICATE KEY UPDATE current_load = VALUES(current_load), status = VALUES(status);

-- 4. Seed initial scaling logs
INSERT INTO scaling_logs (node_id, action_taken, timestamp) VALUES
(1, 'Initialized node node-us-east-1a in region us-east-1.', NOW() - INTERVAL 12 HOUR),
(2, 'Initialized node node-us-east-1b in region us-east-1.', NOW() - INTERVAL 12 HOUR),
(3, 'Scale Up triggered: CPU load exceeded 90% (currently 92%). Adding replica capacity.', NOW() - INTERVAL 15 MINUTE),
(4, 'Scale Down triggered: CPU load fell below 40% (currently 30%). Deallocated micro-instance.', NOW() - INTERVAL 3 HOUR),
(7, 'Resource Warning: High workload detected (85% utilization). System in auto-scale queue.', NOW() - INTERVAL 45 MINUTE);
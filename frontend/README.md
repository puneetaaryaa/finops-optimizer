# Multi-Region Cloud Asset Optimizer Frontend

A premium Next.js dashboard configured with React 18, Tailwind CSS, and TypeScript that visually tracks compute nodes, reports real-time load analytics, and registers cloud cost savings in accordance with FinOps guidelines.

## Features
- **Wow-Factor Interface**: Styled in absolute dark mode with neon cyan and purple glows, premium glassmorphism, responsive grid overlays, and subtle micro-animations.
- **Fail-Safe Design**: Connects dynamically to the Express API (running at `http://localhost:5000`). If the API or MySQL database is offline, it automatically drops back into a client-side sandbox playground. No crashes!
- **Interactive Control Panels**: Allow triggers for Scaling Up, Scaling Down, Spiking Workloads (Traffic Spike simulation), and Dynamically Optimizing (FinOps resizing) clusters.
- **Console Terminal logs**: Displays live event histories, filters items on-the-fly, and outputs visual color-coded operations indicators.

## Prerequisites
- Node.js (v18.17 or higher recommended)
- npm or yarn

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

## Directory Map

- `/src/app/page.tsx` - Main orchestrator managing local and API states, polling loops, and event dispatches.
- `/src/app/globals.css` - Custom glassmorphic blur classes, neon shadow presets, custom scrollbars, and core background variables.
- `/src/components/DashboardHeader.tsx` - Diagnostic summary header, cost scoring algorithms, and average workload calculations.
- `/src/components/RegionOverview.tsx` - Interactive geographic filter selectors.
- `/src/components/NodeGrid.tsx` - Dynamic cluster layouts and operations panel.
- `/src/components/ScalingLogsTable.tsx` - Terminal style console.
- `/src/components/MetricsCharts.tsx` - FinOps ledger graphs and workload bars.

# ==========================================
# STAGE 1: Build stage
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install all dependencies (including devDependencies for tsc)
RUN npm ci

# Copy tsconfig and source code
# Copy tsconfig and source code
COPY backend/tsconfig.json ./
COPY backend/src/ ./src

# Compile TypeScript to production JavaScript inside dist/
RUN npm run build

# ==========================================
# STAGE 2: Runtime stage
# ==========================================
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=5000

# Copy package configurations and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# Expose server listener port
EXPOSE 5000

# Start Express Production Server
CMD ["node", "dist/index.js"]

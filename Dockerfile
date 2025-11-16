# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the Vite project
RUN bun run build

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose the port
EXPOSE 5173

# Start the preview server using the installed vite
CMD ["./node_modules/.bin/vite", "preview", "--host", "0.0.0.0", "--port", "5173"]

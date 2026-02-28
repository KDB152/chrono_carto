# Stage 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY tsconfig.json ./          
COPY nest-cli.json ./           

RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Install only runtime dependencies + TypeORM CLI for migrations
COPY package*.json ./
COPY tsconfig.json ./           
COPY nest-cli.json ./          

RUN npm install --production --legacy-peer-deps \
    && npm install typeorm@0.3.27 ts-node tsconfig-paths mysql2 --save-dev

# Copy compiled JS
COPY --from=builder /usr/src/app/dist ./dist
# Copy node_modules
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Copy src for TS migration generation (needed if you run migrations via ts-node)
COPY --from=builder /usr/src/app/src ./src

# Expose API port
EXPOSE 3001

# Default: run NestJS production
CMD ["node", "--experimental-specifier-resolution=node", "dist/main.js"]

# npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate src/migrations/YourMigrationName -d src/config/database.config.ts
# npm run build
# npx typeorm migration:run -d dist/config/database.config.js
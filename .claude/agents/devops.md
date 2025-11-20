# DevOps Agent - Deployment & Infrastructure Expert

## Role
DevOps specialist ensuring smooth deployment, infrastructure management, monitoring, and operational excellence for the Quran Memorizer app.

## Core Responsibilities
1. **Docker Management**: Container configuration and orchestration
2. **CI/CD Pipelines**: Automated deployment workflows
3. **Environment Configuration**: Development, staging, production
4. **Monitoring & Logging**: Application health and performance
5. **Backup & Recovery**: Data protection strategies

## Current Infrastructure

### Technology Stack
- **Application**: Next.js 15 (Node.js runtime)
- **Database**: PostgreSQL 15 (Docker container)
- **Containerization**: Docker & Docker Compose
- **Platform**: Can deploy to Vercel, Railway, or self-hosted

### Docker Setup

#### PostgreSQL Container
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: quran-memorizer-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: quran_memorizer
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

#### Application Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Full Stack Docker Compose
```yaml
# docker-compose.full.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: quran-memorizer-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/quran_memorizer
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    container_name: quran-memorizer-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: quran_memorizer
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

## CI/CD Pipeline

### GitHub Actions

#### Test & Build
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Build application
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  docker-build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: false
          tags: quran-memorizer:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

#### Deploy to Production
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-vercel:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-docker:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/quran-memorizer:latest
            ${{ secrets.DOCKER_USERNAME }}/quran-memorizer:${{ github.sha }}

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/quran-memorizer
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T app npx prisma migrate deploy
```

## Environment Configuration

### Development (.env.local)
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quran_memorizer?schema=public"

# Next.js
NEXTAUTH_SECRET="development-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# API Keys (Development)
QURAN_API_KEY="development-key"
```

### Production (.env.production)
```bash
# Database (use connection pooler for serverless)
DATABASE_URL="postgresql://user:password@host:5432/quran_memorizer?pgbouncer=true"

# Next.js
NEXTAUTH_SECRET="${SECURE_RANDOM_STRING}"
NEXTAUTH_URL="https://quran-memorizer.com"

# API Keys
QURAN_API_KEY="${PRODUCTION_API_KEY}"

# Monitoring
SENTRY_DSN="${SENTRY_DSN}"
```

### Environment Validation
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

// Use env.DATABASE_URL instead of process.env.DATABASE_URL
```

## Monitoring & Logging

### Application Monitoring with Sentry
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Structured Logging with Pino
```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
});

// Usage
logger.info({ verseKey: '1:1' }, 'Fetching verse');
logger.error({ error }, 'Failed to fetch verse');
```

### Health Check Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

## Database Management

### Backup Strategy

#### Automated Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/quran-memorizer"
DB_NAME="quran_memorizer"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
docker exec quran-memorizer-postgres pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

#### Cron Job
```bash
# Add to crontab (crontab -e)
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### Database Restore
```bash
# Restore from backup
gunzip -c backup_20240101_020000.sql.gz | docker exec -i quran-memorizer-postgres psql -U postgres -d quran_memorizer
```

## Performance Optimization

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone for Docker
  output: 'standalone',

  // Compress responses
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Bundle analyzer (optional)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),
};

module.exports = nextConfig;
```

### PostgreSQL Tuning
```conf
# postgresql.conf

# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# Connections
max_connections = 100

# Write-Ahead Log
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planner
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200

# Autovacuum
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 10s
```

## Deployment Platforms

### Vercel
```json
// vercel.json
{
  "buildCommand": "npx prisma generate && next build",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

### Railway
```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "npx prisma migrate deploy && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "app"
```

### Self-Hosted (systemd)
```ini
# /etc/systemd/system/quran-memorizer.service
[Unit]
Description=Quran Memorizer Application
After=network.target postgresql.service

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/quran-memorizer
ExecStart=/usr/bin/npm start
Restart=always
Environment="NODE_ENV=production"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

## Monitoring Dashboard

### Grafana + Prometheus Setup
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  grafana_data:
```

## Security Checklist

### Before Production Deployment:
- [ ] Environment variables secured (no .env in git)
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Database backups automated
- [ ] Monitoring and alerting set up
- [ ] Health checks configured
- [ ] Secrets rotated
- [ ] Dependency vulnerabilities fixed (`npm audit`)
- [ ] Docker images scanned for vulnerabilities

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs quran-memorizer-postgres

# Test connection
docker exec -it quran-memorizer-postgres psql -U postgres -d quran_memorizer
```

#### Application Crashes
```bash
# Check application logs
docker logs quran-memorizer-app

# Check resources
docker stats

# Restart services
docker-compose restart
```

#### Migration Failures
```bash
# Check migration status
npx prisma migrate status

# Reset database (DANGER - development only)
npx prisma migrate reset

# Manual migration
npx prisma migrate deploy
```

## Deliverables Format

When completing DevOps tasks:

1. **Infrastructure Changes**: Docker/config files modified
2. **Deployment Steps**: How to deploy changes
3. **Verification**: How to verify deployment succeeded
4. **Rollback Plan**: How to revert if issues occur
5. **Monitoring**: What metrics to watch
6. **Documentation**: Updated deployment docs

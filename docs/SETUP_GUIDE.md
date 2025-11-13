# Setup Guide - Run Without Blockers

This guide ensures your backend and frontend run smoothly with `nx serve` without any port conflicts or blockers.

## 🚀 Quick Start (3 Steps)

### 1. Setup Environment

```bash
# Copy environment variables
cp env.example .env

# Or run the setup script (recommended)
./setup.sh
```

### 2. Start Services

```bash
# Option A: Use the helper script
./start-services.sh

# Option B: Start manually
# PostgreSQL
brew services start postgresql@14

# Redis  
brew services start redis

# RabbitMQ
brew services start rabbitmq
```

### 3. Run the Application

```bash
# Kill any stuck processes first
./kill-ports.sh

# Start backend in one terminal
pnpm nx serve backend

# Start frontend in another terminal
pnpm nx serve frontend
```

## 🔧 Troubleshooting Port Conflicts

### Problem: `EADDRINUSE: address already in use :::3333`

**Solution:**

```bash
# Quick fix - run the cleanup script
./kill-ports.sh

# Or manually kill processes
lsof -ti:3333 | xargs kill -9
lsof -ti:4200 | xargs kill -9
pkill -9 -f "nx serve"
```

### Problem: Multiple nx processes running

**Solution:**

```bash
# Reset Nx cache and kill all processes
./kill-ports.sh
pnpm nx reset

# Then restart
pnpm nx serve backend
```

### Problem: Services not starting

**Solution:**

```bash
# Check service status
pg_isready            # PostgreSQL
redis-cli ping        # Redis
rabbitmqctl status    # RabbitMQ

# Restart services
./start-services.sh
```

## 📋 Environment Variables

The `.env` file should contain:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trading_bot

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Backend
PORT=3333
NODE_ENV=development
BACKEND_URL=http://localhost:3333

# Pool Sync
ENABLE_POOL_SYNC=true
DRAGONSWAP_API_URL=https://api.dragonswap.app/v1
SAILOR_API_URL=https://api.sailor.finance/v1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3333/api
FRONTEND_URL=http://localhost:4200

# Logging
LOG_LEVEL=info
LOG_QUERIES=false
```

## 🛠️ Helper Scripts

### `./setup.sh`
Complete environment setup:
- Creates .env file
- Checks services
- Creates database
- Runs migrations

```bash
./setup.sh
```

### `./start-services.sh`
Starts all required services:
- PostgreSQL
- Redis
- RabbitMQ

```bash
./start-services.sh
```

### `./kill-ports.sh`
Cleans up stuck processes:
- Kills processes on ports 3333, 4200
- Kills all nx serve processes
- Frees up debugger ports

```bash
./kill-ports.sh
```

## 🔄 Development Workflow

### Normal Startup

```bash
# Terminal 1: Backend
pnpm nx serve backend

# Terminal 2: Frontend
pnpm nx serve frontend
```

### With Port Issues

```bash
# 1. Clean up
./kill-ports.sh

# 2. Reset Nx
pnpm nx reset

# 3. Start fresh
pnpm nx serve backend
pnpm nx serve frontend
```

### After Git Pull

```bash
# 1. Update dependencies
pnpm install

# 2. Run new migrations
pnpm db:migrate

# 3. Start services
pnpm nx serve backend
pnpm nx serve frontend
```

## 🐳 Using Docker (Alternative)

If you prefer Docker for services:

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individually
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres --name postgres postgres:14
docker run -d -p 6379:6379 --name redis redis:7
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management
```

## 📊 Verify Everything is Running

```bash
# Check backend
curl http://localhost:3333/api/pools
# Expected: {"success":true,"data":[],...}

# Check frontend
open http://localhost:4200/en

# Check Swagger docs
open http://localhost:3333/api/docs

# Check services
pg_isready                                    # PostgreSQL
redis-cli ping                                # Redis (should return PONG)
curl -s http://localhost:15672 >/dev/null    # RabbitMQ (port open)
```

## 🎯 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3333 in use | `./kill-ports.sh` then restart |
| Port 4200 in use | `./kill-ports.sh` then restart |
| Database connection error | Check PostgreSQL is running: `pg_isready` |
| Redis connection error | Check Redis is running: `redis-cli ping` |
| RabbitMQ connection error | Check RabbitMQ: `rabbitmqctl status` |
| Nx hanging | `pnpm nx reset` and clear cache |
| Migration errors | `pnpm db:setup` to recreate database |
| Changes not reflecting | Clear browser cache, restart both services |

## 📝 Useful Commands

```bash
# Database
pnpm db:setup          # Setup database from scratch
pnpm db:migrate        # Run migrations
pnpm db:studio         # Open Drizzle Studio
pnpm db:generate       # Generate new migration

# Development
pnpm nx serve backend  # Start backend
pnpm nx serve frontend # Start frontend
pnpm nx build backend  # Build backend
pnpm nx build frontend # Build frontend

# Cleanup
./kill-ports.sh        # Kill all processes
pnpm nx reset          # Reset Nx cache
rm -rf node_modules    # Clean install (if needed)
pnpm install           # Reinstall dependencies

# Testing
pnpm nx test backend   # Run backend tests
pnpm nx test frontend  # Run frontend tests
pnpm nx lint backend   # Lint backend
pnpm nx lint frontend  # Lint frontend
```

## 🚦 Startup Checklist

Before starting development:

- [ ] PostgreSQL is running (`pg_isready`)
- [ ] Redis is running (`redis-cli ping`)
- [ ] RabbitMQ is running (`curl http://localhost:15672`)
- [ ] `.env` file exists and is configured
- [ ] Database migrations are up to date (`pnpm db:migrate`)
- [ ] No processes on port 3333 (`lsof -ti:3333`)
- [ ] No processes on port 4200 (`lsof -ti:4200`)
- [ ] Dependencies are installed (`pnpm install`)

## 📞 Need Help?

If you're still experiencing issues:

1. Check logs in the terminal where services are running
2. Review [CRON_SYNC_SETUP.md](./CRON_SYNC_SETUP.md) for sync-specific issues
3. Review [pools-integration.md](./pools-integration.md) for integration issues
4. Run `./kill-ports.sh` and try again
5. Check service logs:
   - Backend: Look at terminal output
   - PostgreSQL: Check logs in data directory
   - Redis: `redis-cli monitor`
   - RabbitMQ: Check management UI at http://localhost:15672

---

**You're all set! Run `./setup.sh` to get started.** 🎉


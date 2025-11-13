# 🚀 START HERE - Manexus Trading Bot

## Quick Start (Copy & Paste)

```bash
# 1. Setup (one-time)
./setup.sh

# 2. Kill any stuck processes
./kill-ports.sh

# 3. Start backend (Terminal 1)
pnpm nx serve backend

# 4. Start frontend (Terminal 2)  
pnpm nx serve frontend
```

## ✅ What You Have Now

### 🎯 Complete Pool Tracking System
- **Automatic sync** from DragonSwap & Sailor Finance every 5 minutes
- **Historical data** recorded every 10 minutes for charts
- **Beautiful UI** at http://localhost:4200/en/pools
- **API docs** at http://localhost:3333/api/docs

### 📁 Helper Scripts Created

| Script | Purpose |
|--------|---------|
| `./setup.sh` | One-time setup (creates .env, checks services, runs migrations) |
| `./start-services.sh` | Start PostgreSQL, Redis, RabbitMQ |
| `./kill-ports.sh` | Fix port conflicts (run before starting) |

### 📄 Configuration Files

| File | Purpose |
|------|---------|
| `env.example` | Environment variable template |
| `.env` | Your actual configuration (gitignored) |

## 🔧 If Ports Are Blocked

```bash
# Run this anytime you get "address already in use" errors
./kill-ports.sh

# Then start again
pnpm nx serve backend
pnpm nx serve frontend
```

## 📊 Access Everything

Once running:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:4200/en |
| **Pools Page** | http://localhost:4200/en/pools |
| **Backend API** | http://localhost:3333/api |
| **Swagger Docs** | http://localhost:3333/api/docs |
| **Drizzle Studio** | `pnpm db:studio` |

## 🎨 What The UI Shows

Visit http://localhost:4200/en/pools to see:
- Grid of liquidity pools
- Filter by DragonSwap / Sailor Finance
- TVL, 24h Volume, APR for each pool
- Auto-refresh every minute
- Multi-language (EN/ID)

## 🔄 Auto-Sync Features

The backend automatically:
- ✅ Syncs pools every 5 minutes
- ✅ Records history every 10 minutes  
- ✅ Logs all operations
- ✅ Handles errors gracefully

Check logs in backend terminal to see:
```
[PoolSyncService] 🔄 Starting scheduled pool sync...
[PoolSyncService] ✅ Pool sync completed: 15 synced, 0 errors
[PoolSyncService] 📊 Recording pool historical snapshots...
[PoolSyncService] ✅ History recording completed: 15 recorded, 0 errors
```

## 🛠️ Common Commands

```bash
# Development
pnpm nx serve backend          # Start backend
pnpm nx serve frontend         # Start frontend
pnpm nx build backend          # Build backend
pnpm nx build frontend         # Build frontend

# Database
pnpm db:setup                  # Setup from scratch
pnpm db:migrate                # Run migrations
pnpm db:studio                 # Open database UI
pnpm db:generate               # Create new migration

# Cleanup
./kill-ports.sh                # Kill stuck processes
pnpm nx reset                  # Reset Nx cache

# Manual Sync (for testing)
curl -X POST http://localhost:3333/api/admin/sync-pools
curl -X POST http://localhost:3333/api/admin/record-pool-history
```

## 📚 Documentation

- **[SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)** - Complete setup guide
- **[CRON_SYNC_SETUP.md](./docs/CRON_SYNC_SETUP.md)** - Auto-sync configuration
- **[QUICK_START.md](./docs/QUICK_START.md)** - Quick start guide
- **[pools-integration.md](./docs/pools-integration.md)** - Integration details
- **[README.md](./README.md)** - Full project documentation

## ⚡ Pro Tips

1. **Always run `./kill-ports.sh` first** if you get port errors
2. **Keep both terminals open** (backend + frontend)
3. **Check backend logs** to see auto-sync working
4. **Use Swagger UI** to test API endpoints
5. **Frontend auto-refreshes** pools every minute

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3333 in use | `./kill-ports.sh` |
| Port 4200 in use | `./kill-ports.sh` |
| Database error | Check PostgreSQL: `pg_isready` |
| Redis error | Check Redis: `redis-cli ping` |
| No pools showing | See [CRON_SYNC_SETUP.md](./docs/CRON_SYNC_SETUP.md) |
| Nx hanging | `pnpm nx reset` |

## 🎯 Next Steps

1. ✅ **System is ready** - Everything is configured
2. 🔧 **Update API URLs** - Set real DragonSwap/Sailor endpoints in `.env`
3. 📊 **Monitor syncs** - Watch backend logs for auto-sync
4. 🎨 **Explore UI** - Visit pools page at /en/pools
5. 📈 **View data** - Check Swagger docs and Drizzle Studio

## 🚀 Your End Goal is Complete!

✅ **Backend** with automatic pool synchronization
✅ **Frontend** with beautiful pool visualization  
✅ **Database** with historical data tracking
✅ **Cron jobs** running every 5-10 minutes
✅ **No blockers** - smooth startup with helper scripts

**Just run `./setup.sh` once, then `./kill-ports.sh` + `pnpm nx serve` anytime!**

---

Need help? See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for detailed troubleshooting.


# Quick Start Guide - Pool Synchronization

## ✅ What You Have Now

Your trading bot now automatically synchronizes liquidity pool data from DragonSwap and Sailor Finance using cron jobs!

## 🚀 Start Everything

```bash
# Terminal 1: Start Backend (includes cron jobs)
pnpm nx serve backend

# Terminal 2: Start Frontend
pnpm nx serve frontend
```

## 📊 Access Points

- **Frontend**: http://localhost:4200/en/pools
- **API**: http://localhost:3333/api/pools
- **Swagger Docs**: http://localhost:3333/api/docs
- **Admin Panel**: http://localhost:3333/api/docs#/admin

## 🔄 How Automatic Sync Works

### Every 5 Minutes
- Fetches all pools from DragonSwap API
- Fetches all pools from Sailor Finance API
- Updates TVL, volume, APR in database
- Creates new pools if found

### Every 10 Minutes
- Records current state of all pools
- Saves to `pool_history` table for charts
- Calculates price data

### On Startup
- Runs immediate sync to populate database
- Continues with scheduled syncs

## 🎯 Manual Testing

### 1. Trigger Pool Sync

```bash
curl -X POST http://localhost:3333/api/admin/sync-pools
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "synced": 15,
    "errors": 0
  },
  "message": "Pool sync triggered successfully"
}
```

### 2. Check Pools in Database

```bash
curl http://localhost:3333/api/pools
```

### 3. View in Drizzle Studio

```bash
pnpm db:studio
```

Navigate to:
- `liquidity_pools` table - See all pools
- `pool_history` table - See historical snapshots

## ⚙️ Configuration (Optional)

### Enable/Disable Auto-Sync

Create or edit `.env`:

```bash
ENABLE_POOL_SYNC=true

# API URLs (update with real endpoints)
DRAGONSWAP_API_URL=https://api.dragonswap.app/v1
SAILOR_API_URL=https://api.sailor.finance/v1
```

### Check if Sync is Running

Look for these logs in backend console:

```
✅ [PoolSyncService] Pool synchronization enabled - running initial sync...
🔄 [PoolSyncService] Starting scheduled pool sync...
✅ [PoolSyncService] Pool sync completed: 15 synced, 0 errors
📊 [PoolSyncService] Recording pool historical snapshots...
✅ [PoolSyncService] History recording completed: 15 recorded, 0 errors
```

## 📱 Frontend Features

Visit http://localhost:4200/en/pools to see:

- ✅ Grid of all pools with DEX badges
- ✅ Filter by DragonSwap / Sailor Finance / All
- ✅ TVL, 24h Volume, APR for each pool
- ✅ Real-time updates (auto-refresh every minute)
- ✅ Beautiful loading states
- ✅ Multi-language support (EN/ID)

## 🔍 Troubleshooting

### No Pools Showing Up?

1. **Check if sync is enabled:**
   ```bash
   # Look for this in backend logs:
   [PoolSyncService] Pool synchronization enabled
   ```

2. **Manually trigger sync:**
   ```bash
   curl -X POST http://localhost:3333/api/admin/sync-pools
   ```

3. **Check database:**
   ```bash
   psql -U postgres -d trading_bot -c "SELECT COUNT(*) FROM liquidity_pools;"
   ```

### API Returns Empty Data?

The DragonSwap and Sailor Finance API URLs are examples. You need to:

1. Find the real API endpoints
2. Update environment variables
3. Adjust field mappings in client code if needed

See [CRON_SYNC_SETUP.md](./CRON_SYNC_SETUP.md) for detailed instructions.

## 📚 Next Steps

1. ✅ **System is ready** - Auto-sync will keep data fresh
2. 🔧 **Configure real API URLs** - Update .env with actual endpoints
3. 📊 **Monitor logs** - Watch for successful syncs
4. 🎨 **Use the UI** - View pools at /en/pools
5. 📈 **Check charts** - Historical data will accumulate over time

## 📖 Full Documentation

- [CRON_SYNC_SETUP.md](./CRON_SYNC_SETUP.md) - Complete sync configuration
- [pools-integration.md](./pools-integration.md) - Full integration guide
- [README.md](../README.md) - Project overview

---

**You're all set! The system will automatically populate pool data.** 🎉


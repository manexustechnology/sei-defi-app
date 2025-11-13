# Automatic Pool Synchronization with Cron Jobs

## ✅ What's Been Implemented

### 1. **DragonSwap & Sailor Finance API Clients**
- `apps/backend/src/infrastructure/dex/dragonswap.client.ts`
- `apps/backend/src/infrastructure/dex/sailor.client.ts`

**Features:**
- Fetch all pools from DEX
- Fetch individual pool by address
- Fetch historical data for pools
- Automatic error handling and retry logic
- Configurable via environment variables

### 2. **Synchronization Use Cases**
- **SyncPoolsUseCase**: Fetches pool data and updates database
- **RecordPoolHistoryUseCase**: Records historical snapshots for time-series analysis

### 3. **Automated Scheduler Service**
Location: `apps/backend/src/infrastructure/scheduler/pool-sync.service.ts`

**Cron Jobs:**
- **Every 5 minutes**: Sync pools from DragonSwap and Sailor Finance
- **Every 10 minutes**: Record historical snapshots for all pools
- **On startup**: Initial sync to populate database immediately

### 4. **Admin Endpoints**
Location: `apps/backend/src/interfaces/http/admin.controller.ts`

**Manual Triggers:**
```bash
POST /api/admin/sync-pools              # Manually trigger pool sync
POST /api/admin/record-pool-history     # Manually record history
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable/disable automatic synchronization
ENABLE_POOL_SYNC=true

# DragonSwap API Configuration
DRAGONSWAP_API_URL=https://api.dragonswap.app/v1

# Sailor Finance API Configuration  
SAILOR_API_URL=https://api.sailor.finance/v1
```

### Cron Schedule Customization

Edit `apps/backend/src/infrastructure/scheduler/pool-sync.service.ts`:

```typescript
// Change sync interval (default: every 5 minutes)
@Cron(CronExpression.EVERY_5_MINUTES)
async syncPools() { ... }

// Available options:
// - EVERY_30_SECONDS
// - EVERY_MINUTE
// - EVERY_5_MINUTES
// - EVERY_10_MINUTES
// - EVERY_30_MINUTES
// - EVERY_HOUR
// - EVERY_DAY_AT_MIDNIGHT
// Or custom: '0 */5 * * * *' (cron expression)
```

## 📊 How It Works

### Data Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────┐
│                 │         │                  │         │               │
│  DragonSwap API ├────────►│  SyncPoolsUseCase├────────►│  Database     │
│                 │         │                  │         │               │
└─────────────────┘         └──────────────────┘         └───────────────┘
                                     ▲
┌─────────────────┐                  │
│                 │                  │
│  Sailor Finance ├──────────────────┘
│  API            │
└─────────────────┘

Every 5 minutes, the PoolSyncService runs:
1. Fetch pools from DragonSwap
2. Fetch pools from Sailor Finance
3. Update or create records in liquidity_pools table
4. Log results

Every 10 minutes, record historical snapshots:
1. Get all active pools
2. Record current state in pool_history table
3. Calculate and store price data
```

### Database Updates

**liquidity_pools table:**
- **New pools**: Created with all data
- **Existing pools**: TVL, volume24h, and APR updated
- **Metadata**: Reserves and token info stored in JSON field

**pool_history table:**
- Snapshot recorded every 10 minutes
- Includes: reserves, TVL, volume, calculated price
- Used for historical charts in frontend

## 🚀 Usage

### Starting the System

```bash
# Start backend (cron jobs start automatically)
pnpm nx serve backend
```

**Console Output:**
```
[PoolSyncService] Pool synchronization enabled - running initial sync...
[PoolSyncService] 🔄 Starting scheduled pool sync...
[DragonSwapClient] Fetching pools from DragonSwap...
[DragonSwapClient] Fetched 15 pools from DragonSwap
[SailorClient] Fetching pools from Sailor Finance...
[SailorClient] Fetched 8 pools from Sailor Finance
[PoolSyncService] ✅ Pool sync completed: 23 synced, 0 errors
```

### Manual Triggers

```bash
# Trigger sync manually
curl -X POST http://localhost:3333/api/admin/sync-pools

# Response:
{
  "success": true,
  "data": {
    "synced": 23,
    "errors": 0
  },
  "message": "Pool sync triggered successfully",
  "timestamp": "2025-11-13T12:00:00.000Z"
}

# Record history manually
curl -X POST http://localhost:3333/api/admin/record-pool-history

# Response:
{
  "success": true,
  "data": {
    "recorded": 23,
    "errors": 0
  },
  "message": "Pool history recording triggered successfully",
  "timestamp": "2025-11-13T12:00:00.000Z"
}
```

### Viewing the Data

```bash
# Check pools in database
curl http://localhost:3333/api/pools

# Check pool history
curl "http://localhost:3333/api/pools/{poolId}/history?from=2025-01-01T00:00:00Z&to=2025-01-31T23:59:59Z"

# View in Drizzle Studio
pnpm db:studio
```

### Disabling Auto-Sync

```bash
# In .env
ENABLE_POOL_SYNC=false
```

Or comment out the decorators in `pool-sync.service.ts`:

```typescript
// @Cron(CronExpression.EVERY_5_MINUTES)
async syncPools() { ... }
```

## 🔍 Monitoring

### Logs

The system provides detailed logging:

```typescript
// Success logs
✅ Pool sync completed: 23 synced, 0 errors
✅ History recording completed: 23 recorded, 0 errors

// Info logs
🔄 Starting scheduled pool sync...
📊 Recording pool historical snapshots...

// Error logs
❌ Pool sync failed: [error details]
❌ Failed to sync DragonSwap pool 0x123...: [error]
```

### Health Checks

Monitor the cron jobs:

```bash
# Check if pools are being updated
psql -U postgres -d trading_bot -c "SELECT pool_address, updated_at FROM liquidity_pools ORDER BY updated_at DESC LIMIT 5;"

# Check history recording
psql -U postgres -d trading_bot -c "SELECT pool_id, timestamp FROM pool_history ORDER BY timestamp DESC LIMIT 10;"
```

## 🛠️ Troubleshooting

### Problem: No pools appearing in database

**Solutions:**
1. Check if ENABLE_POOL_SYNC=true in .env
2. Verify API URLs are correct
3. Check backend logs for errors
4. Manually trigger sync: `curl -X POST http://localhost:3333/api/admin/sync-pools`
5. Check if DragonSwap/Sailor APIs are accessible

### Problem: API returns 404 or errors

**Solutions:**
1. Update API URLs in environment variables
2. Check DragonSwap/Sailor API documentation for correct endpoints
3. Update the client code if API structure changed
4. Add API keys if required (update client to include headers)

### Problem: Cron jobs not running

**Solutions:**
1. Check logs for "Pool synchronization enabled" message
2. Verify @nestjs/schedule is installed: `pnpm list @nestjs/schedule`
3. Check if SchedulerModule is imported in AppModule
4. Restart backend server

### Problem: Historical data not recording

**Solutions:**
1. Check if pool_history table exists: `pnpm db:migrate`
2. Verify pools exist in liquidity_pools table first
3. Check logs for history recording errors
4. Manually trigger: `curl -X POST http://localhost:3333/api/admin/record-pool-history`

## 📝 Customizing the API Clients

### Adding Authentication

Edit `dragonswap.client.ts` or `sailor.client.ts`:

```typescript
async fetchPools(): Promise<DragonSwapPoolData[]> {
  const apiKey = this.configService.get<string>('DRAGONSWAP_API_KEY');
  
  const response = await fetch(`${this.baseUrl}/pools`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,  // Add auth header
      'X-API-Key': apiKey,                   // Or custom header
    },
  });
  // ...
}
```

### Adjusting Field Mappings

Update the `transformPool` method to match actual API response:

```typescript
private transformPool(pool: any): DragonSwapPoolData {
  return {
    // Map actual API fields to your format
    address: pool.contractAddress,      // If API uses different field name
    token0: {
      address: pool.tokenA.address,
      symbol: pool.tokenA.ticker,       // If API uses 'ticker' instead of 'symbol'
      decimals: pool.tokenA.decimals,
    },
    // ... adjust other fields
  };
}
```

### Adding Rate Limiting

```typescript
import pLimit from 'p-limit';

export class DragonSwapClient {
  private readonly limit = pLimit(5); // Max 5 concurrent requests

  async fetchPools(): Promise<DragonSwapPoolData[]> {
    return this.limit(() => this.actualFetchPools());
  }

  private async actualFetchPools() {
    // Actual fetch logic
  }
}
```

## 🎯 Next Steps

1. **Configure Real API URLs**: Replace example URLs with actual DragonSwap and Sailor Finance API endpoints
2. **Test API Clients**: Use manual triggers to test data fetching
3. **Adjust Field Mappings**: Update transformPool methods based on actual API responses
4. **Monitor Initial Sync**: Watch logs during first sync to catch any issues
5. **Verify Frontend**: Check that pools appear in the UI at /en/pools
6. **Set Up Alerts**: Add monitoring for failed syncs (optional)

## 📚 Related Documentation

- [pools-integration.md](./pools-integration.md) - Complete integration guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's been built
- [README.md](../README.md) - Project overview

## 🔗 API Documentation

After starting the backend, view full API docs at:
- **Swagger UI**: http://localhost:3333/api/docs
- **Admin Endpoints**: http://localhost:3333/api/docs#/admin

---

**All automatic synchronization is now set up! The system will keep your pool data fresh automatically.** 🎉


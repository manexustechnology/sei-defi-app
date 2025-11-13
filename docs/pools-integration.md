# Liquidity Pools Integration

## Overview

This integration enables tracking of liquidity pools from DragonSwap and Sailor Finance, including historical balance data and price tracking.

## Architecture

### Backend (NestJS)

#### Database Schema

**`liquidity_pools` table:**

- `id` - UUID primary key
- `pool_address` - Unique pool address
- `dex` - DEX identifier ('dragonswap' | 'sailor')
- `token0`, `token1` - Token addresses
- `token0_symbol`, `token1_symbol` - Token symbols
- `fee_tier` - Pool fee tier
- `tvl` - Total Value Locked
- `volume_24h` - 24-hour volume
- `apr` - Annual Percentage Rate
- `metadata` - Additional pool information (JSONB)
- `is_active` - Pool status
- `created_at`, `updated_at` - Timestamps

**`pool_history` table:**

- `id` - UUID primary key
- `pool_id` - Foreign key to `liquidity_pools`
- `timestamp` - Data point timestamp
- `reserve0`, `reserve1` - Token reserves
- `tvl` - Total Value Locked at timestamp
- `volume` - Volume at timestamp
- `price` - Token price (token0/token1)
- `created_at` - Record creation timestamp

#### API Endpoints

```
GET /api/pools
  Query params:
    - dex?: 'dragonswap' | 'sailor'
    - isActive?: boolean
  Returns: List of all pools

GET /api/pools/:poolId/history
  Query params:
    - from: ISO 8601 datetime
    - to: ISO 8601 datetime
  Returns: Historical data for the specified pool
```

#### Domain Model

- **Pool Entity**: Represents a liquidity pool with business logic
- **PoolRepository**: Data access layer for pools
- **Use Cases**:
  - `GetPoolsUseCase`: Retrieve all pools with optional filters
  - `GetPoolHistoryUseCase`: Retrieve historical data for a pool

### Frontend (Next.js)

#### Pages

- `/[locale]/pools` - Pool list page with DEX filtering
- Pool detail views (can be added as needed)

#### Components

**`PoolList`** (`components/pools/pool-list.tsx`):

- Displays all pools in a grid layout
- Filters by DEX (DragonSwap, Sailor Finance, or All)
- Shows TVL, 24h Volume, and APR for each pool
- Real-time updates with React Query

**`PoolChart`** (`components/pools/pool-chart.tsx`):

- Interactive chart using Recharts
- Multiple metrics: TVL, Volume, Price
- Time-series visualization with tooltips

**`PoolDetail`** (`components/pools/pool-detail.tsx`):

- Detailed pool information
- Time range selector (24H, 7D, 30D)
- Integrates PoolChart for historical data

#### Hooks

**`usePools`** (`hooks/use-pools.ts`):

```typescript
usePools(dex?: 'dragonswap' | 'sailor')
// Returns: { data, isLoading, error, refetch, isFetching }
```

**`usePoolHistory`** (`hooks/use-pools.ts`):

```typescript
usePoolHistory(poolId: string, from: Date, to: Date)
// Returns: { data, isLoading, error, refetch }
```

#### API Routes

- `GET /api/pools` - Proxies to backend with caching
- `GET /api/pools/[poolId]/history` - Proxies to backend with caching

## Usage

### 1. Running Database Migrations

```bash
# Generate new migration after schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Or setup database from scratch
pnpm db:setup
```

### 2. Starting the Backend

```bash
pnpm nx serve backend
```

Backend will be available at: http://localhost:3333

Swagger documentation: http://localhost:3333/api/docs

### 3. Starting the Frontend

```bash
pnpm nx serve frontend
```

Frontend will be available at: http://localhost:4200

### 4. Accessing Pool Data

Navigate to:

- English: http://localhost:4200/en/pools
- Indonesian: http://localhost:4200/id/pools

## Data Population

Currently, the pool tables are empty. To populate them, you'll need to:

1. **Create a data ingestion service** that:

   - Fetches pool data from DragonSwap API
   - Fetches pool data from Sailor Finance API
   - Transforms the data to match your schema
   - Saves to the database using the PoolRepository

2. **Example ingestion structure**:

```typescript
// apps/backend/src/infrastructure/dex/dragonswap.service.ts
@Injectable()
export class DragonSwapService {
  async fetchPools() {
    // Fetch from DragonSwap API
    // Transform data
    // Return pool data
  }
}

// apps/backend/src/core/application/use-cases/sync-pools.use-case.ts
@Injectable()
export class SyncPoolsUseCase {
  constructor(private dragonSwapService: DragonSwapService, private sailorService: SailorFinanceService, @Inject(POOL_REPOSITORY) private poolRepository: PoolRepositoryPort) {}

  async execute() {
    const dragonPools = await this.dragonSwapService.fetchPools();
    const sailorPools = await this.sailorService.fetchPools();

    for (const poolData of [...dragonPools, ...sailorPools]) {
      const pool = Pool.create(poolData);
      await this.poolRepository.save(pool);
    }
  }
}
```

3. **Schedule periodic syncing** using NestJS Schedule or cron jobs

## Next Steps

To complete the integration:

1. **Implement DEX data fetchers**:

   - Create services to fetch data from DragonSwap
   - Create services to fetch data from Sailor Finance
   - Handle API rate limits and errors

2. **Add data synchronization**:

   - Create a scheduled job to sync pool data
   - Create a scheduled job to record historical snapshots
   - Implement error handling and retries

3. **Enhance UI**:

   - Add pool search/filtering
   - Add sorting options (by TVL, APR, etc.)
   - Add pool comparison features
   - Add favorites/watchlist

4. **Add analytics**:

   - Calculate pool performance metrics
   - Add impermanent loss calculator
   - Show liquidity depth charts

5. **Notifications**:
   - Alert on significant TVL changes
   - Alert on APR threshold crossings
   - Alert on new pool additions

## Environment Variables

Make sure these are set in your `.env` file:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trading_bot
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
BACKEND_URL=http://localhost:3333  # For frontend
```

## API Response Format

All responses follow this standardized format:

```json
{
  "success": true,
  "data": [...],  // or single object
  "message": "Pools retrieved successfully",
  "timestamp": "2025-11-13T12:00:00.000Z"
}
```

## Technologies Used

### Backend

- NestJS (Framework)
- Drizzle ORM (Database)
- PostgreSQL (Database)
- Redis (Caching)
- RabbitMQ (Messaging)
- Swagger (API Documentation)

### Frontend

- Next.js 14 (Framework)
- React Query (Data fetching)
- Recharts (Charts)
- Tailwind CSS (Styling)
- Zustand (State management)

## Testing

Access the API documentation at http://localhost:3333/api/docs to test the endpoints directly.

Use the Swagger UI to:

1. Test `GET /api/pools` with different filters
2. Create mock pool data (you'll need to add a POST endpoint)
3. Test historical data retrieval

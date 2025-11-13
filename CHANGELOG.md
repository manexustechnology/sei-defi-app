# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-11-13

### Added - Pool Synchronization System 🎉

#### Backend
- **Automatic Pool Sync**: Cron jobs that sync pool data every 5 minutes
- **Historical Recording**: Records pool snapshots every 10 minutes
- **DragonSwap Client**: API client for fetching DragonSwap pool data
- **Sailor Finance Client**: API client for fetching Sailor Finance pool data
- **SyncPoolsUseCase**: Business logic for synchronizing pools
- **RecordPoolHistoryUseCase**: Business logic for recording historical data
- **PoolSyncService**: NestJS service with @Cron decorators
- **Admin API Endpoints**: Manual triggers for sync and history recording
  - `POST /api/admin/sync-pools`
  - `POST /api/admin/record-pool-history`
- **Database Schema**: 
  - `liquidity_pools` table with 15 fields
  - `pool_history` table for time-series data
  - Proper indexes for performance
- **Pool Repository**: Full CRUD operations with Drizzle ORM
- **Auto-sync on startup**: Initial sync runs when backend starts

#### Frontend
- **Pool List Page**: Beautiful grid display at `/[locale]/pools`
- **DEX Filtering**: Filter by DragonSwap, Sailor Finance, or All
- **Pool Charts**: Interactive Recharts visualization
  - TVL chart
  - Volume chart  
  - Price chart
- **Pool Detail Component**: Detailed pool information with time ranges
- **Navigation Component**: Tab navigation between Dashboard and Pools
- **React Hooks**: `usePools` and `usePoolHistory` for data fetching
- **API Proxy Routes**: Next.js API routes for backend communication
- **Multi-language**: EN and ID translations for all pool features
- **Auto-refresh**: Pools refresh every minute automatically

#### Development Tools
- **Helper Scripts**:
  - `./setup.sh` - One-time environment setup
  - `./start-services.sh` - Start PostgreSQL, Redis, RabbitMQ
  - `./kill-ports.sh` - Fix port conflicts instantly
- **Configuration**:
  - `env.example` - Comprehensive environment variable template
  - `.env` - Auto-created from example
- **Documentation**:
  - `START_HERE.md` - Quick start guide
  - `SETUP_GUIDE.md` - Comprehensive setup instructions
  - `CRON_SYNC_SETUP.md` - Cron job configuration details
  - `QUICK_START.md` - Fast track guide
  - `IMPLEMENTATION_SUMMARY.md` - What was built
  - `pools-integration.md` - Integration architecture

#### Dependencies
- `@nestjs/schedule@6.0.1` - For cron job scheduling
- `recharts@3.4.1` - For frontend charts

### Fixed
- Port conflict handling with helper scripts
- Drizzle query builder type issues
- Navigation between pages
- Hydration errors in Next.js
- RxJS version conflicts
- Circular dependencies in backend modules

### Configuration
- `ENABLE_POOL_SYNC` - Enable/disable automatic synchronization
- `DRAGONSWAP_API_URL` - DragonSwap API endpoint
- `SAILOR_API_URL` - Sailor Finance API endpoint
- Auto-sync intervals configurable via cron expressions

## [Initial] - 2025-11-12

### Added
- Initial project structure with Nx monorepo
- NestJS backend with Clean Architecture
- Next.js frontend with App Router
- Trading dashboard with order management
- PostgreSQL database with Drizzle ORM
- Redis caching layer
- RabbitMQ messaging
- Swagger API documentation
- Multi-language support (EN/ID)
- Order repository and use cases
- Frontend components with shadcn/ui
- TanStack Query for data fetching
- Zustand for state management

---

## Summary of Latest Update

### What Was Added (2025-11-13)

1. **Complete automatic pool synchronization system**
2. **Frontend pool tracking with charts**
3. **Helper scripts for smooth development**
4. **Comprehensive documentation**
5. **No-blocker setup process**

### Breaking Changes
- None

### Migration Guide
1. Run `./setup.sh` to create `.env` file
2. Run `pnpm db:migrate` to apply new schema
3. Start services normally with `pnpm nx serve`

### Environment Variables Added
```bash
ENABLE_POOL_SYNC=true
DRAGONSWAP_API_URL=https://api.dragonswap.app/v1
SAILOR_API_URL=https://api.sailor.finance/v1
```

### New API Endpoints
```
GET  /api/pools
GET  /api/pools/:poolId/history
POST /api/admin/sync-pools
POST /api/admin/record-pool-history
```

### New Frontend Routes
```
/en/pools    - English pool list
/id/pools    - Indonesian pool list
```

---

**Version**: Development
**Last Updated**: 2025-11-13
**Contributors**: Manexus Team


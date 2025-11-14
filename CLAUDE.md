# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
This project uses **pnpm** as the package manager. Always use `pnpm` instead of `npm`.

```bash
# Install dependencies
pnpm install

# Add dependencies
pnpm add <package-name>
pnpm add -D <package-name>  # dev dependency
```

### Running Applications
```bash
# Start backend (port 3333)
pnpm nx serve backend

# Start frontend (port 4200)
pnpm nx serve frontend

# Build applications
pnpm nx build backend
pnpm nx build frontend
```

### Database Operations
```bash
# First time setup (creates DB + runs migrations)
pnpm db:setup

# Generate migration from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly (development only)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Testing
```bash
# Run tests for specific app
pnpm nx test backend
pnpm nx test frontend

# Run all tests
pnpm nx run-many -t test
```

### Code Quality
```bash
# Lint all projects
pnpm nx run-many -t lint

# Format code
pnpm nx format:write
```

### Helper Scripts
```bash
# Setup environment (one-time)
./setup.sh

# Fix port conflicts
./kill-ports.sh

# Liquidity analysis tool
pnpm liquidity -- <subcommand>
```

## Architecture Overview

### Backend (NestJS - Clean Architecture)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis
- **Messaging**: RabbitMQ
- **API**: RESTful with Swagger documentation

**Key Architectural Patterns:**
- **Clean Architecture** with clear separation:
  - `core/domain/` - Business entities (Order, Pool)
  - `core/application/` - Use cases and ports
  - `infrastructure/` - External integrations (DB, cache, messaging)
  - `interfaces/http/` - Controllers and DTOs

**Critical Backend Components:**
- `PoolSyncService` - Automatic DEX data synchronization (cron jobs every 5 min)
- `RecordPoolHistoryUseCase` - Historical data recording (every 10 min)
- DEX Clients: `DragonSwapClient`, `SailorClient`
- Use cases for all operations: `GetPoolsUseCase`, `PlaceOrderUseCase`, etc.

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **UI**: Tailwind CSS with shadcn/ui components
- **State**: Zustand for client state
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **i18n**: Multi-language support (English/Indonesian)

**Key Frontend Patterns:**
- **Locale-based routing**: `/[locale]/page.tsx`
- **Client components**: Marked with `'use client'` directive
- **Custom hooks**: `use-pools.ts`, `use-orders.ts`
- **Zustand stores**: `trading-store.ts`

## Important Development Notes

### Database Schema
- Uses **Drizzle ORM** with schema in `apps/backend/src/infrastructure/persistence/schema`
- All database operations go through repository pattern
- Migrations are generated from schema changes

### Automatic Pool Synchronization
The system automatically syncs liquidity pool data from DragonSwap and Sailor Finance:
- **Every 5 minutes**: Fetches latest pool data
- **Every 10 minutes**: Records historical snapshots
- **Manual trigger**: `POST /api/admin/sync-pools`

### Orderly Network Integration
- Full trading dashboard integration using `@orderly.network` packages
- Trading components in `components/trading/`
- Real-time order management and charting

### Configuration Management
- Environment variables defined in root `package.json` scripts
- Configuration in `apps/backend/src/config/configuration.ts`
- Validation ensures required environment variables are present

### Port Management
- **Backend**: http://localhost:3333/api
- **Frontend**: http://localhost:4200
- **Swagger Docs**: http://localhost:3333/api/docs
- **Drizzle Studio**: https://local.drizzle.studio (when running `pnpm db:studio`)

## Project Structure

```
apps/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── core/           # Domain & Application layer
│   │   │   ├── domain/     # Entities
│   │   │   └── application/ # Use cases & Ports
│   │   ├── infrastructure/ # Persistence, Cache, Messaging, DEX clients
│   │   └── interfaces/     # HTTP Controllers & DTOs
│   └── migrations/         # Database migrations
│
└── frontend/               # Next.js frontend
    ├── components/         # React components
    │   ├── dashboard/
    │   ├── pools/
    │   ├── trading/        # Orderly trading components
    │   └── ui/            # shadcn/ui components
    └── src/
        ├── app/           # Next.js app routes with locale
        ├── hooks/         # Custom React hooks
        ├── i18n/          # Internationalization
        └── stores/        # Zustand stores
```

## Working with This Codebase

### Adding New Features
1. **Backend**: Follow clean architecture - add use cases in `core/application/`, implement in infrastructure
2. **Frontend**: Add components in appropriate directories, use TanStack Query for data fetching
3. **Database**: Modify schema, generate migrations with `pnpm db:generate`

### Debugging
- Backend logs show pool sync operations
- Use Swagger docs at `/api/docs` to test endpoints
- Drizzle Studio for database inspection
- React Query DevTools for frontend state inspection

### Common Tasks
- **Add new DEX**: Create client in `infrastructure/dex/`, integrate with `PoolSyncService`
- **Add new API endpoint**: Create controller in `interfaces/http/`, use case in `core/application/`
- **Add new page**: Add to `app/[locale]/` with proper layout and internationalization
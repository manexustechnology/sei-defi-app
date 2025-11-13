# Manexus Onchain Trading Bot

A full-stack trading bot application with **automatic liquidity pool tracking** for DragonSwap and Sailor Finance.

## 🚀 Quick Start

```bash
# 1. Setup environment (one-time)
./setup.sh

# 2. Fix any port conflicts
./kill-ports.sh

# 3. Start backend (Terminal 1)
pnpm nx serve backend

# 4. Start frontend (Terminal 2)
pnpm nx serve frontend
```

**See [START_HERE.md](./START_HERE.md) for detailed instructions.**

## ✨ Features

- **🔄 Automatic Pool Sync**: Cron jobs sync pool data every 5 minutes
- **📊 Historical Tracking**: Records pool history every 10 minutes for charts
- **📈 Trading Dashboard**: Monitor trading positions and performance
- **🏊 Liquidity Pool Tracking**: Track pools from DragonSwap and Sailor Finance
- **📉 Historical Data**: View historical balances, TVL, volume, and price charts
- **🌍 Multi-language**: English and Indonesian support
- **⚡ Real-time Updates**: Live data with React Query
- **📚 API Documentation**: Swagger/OpenAPI documentation
- **🎯 No Blockers**: Helper scripts for smooth development

## 🏗️ Architecture

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis
- **Messaging**: RabbitMQ
- **API**: RESTful with Swagger documentation

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS with shadcn/ui components
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **i18n**: Multi-language support

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
- Redis 6+
- RabbitMQ 3.11+

## 🛠️ Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trading_bot

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Frontend (for API proxy)
BACKEND_URL=http://localhost:3333
```

### 3. Setup Database

```bash
# Create database and run migrations
pnpm db:setup
```

### 4. Start Services

Make sure PostgreSQL, Redis, and RabbitMQ are running:

```bash
# Check PostgreSQL
psql -U postgres -c "SELECT version();"

# Check Redis
redis-cli ping

# Check RabbitMQ
rabbitmqctl status
```

### 5. Start Applications

```bash
# Start backend (port 3333)
pnpm nx serve backend

# Start frontend (port 4200)
pnpm nx serve frontend
```

## 📚 Access Points

- **Frontend**: http://localhost:4200
  - Dashboard: http://localhost:4200/en
  - Pools: http://localhost:4200/en/pools
  
- **Backend API**: http://localhost:3333/api
  - Swagger Docs: http://localhost:3333/api/docs
  - Trading Orders: http://localhost:3333/api/trading/orders
  - Pools: http://localhost:3333/api/pools

## 🗂️ Project Structure

```
.
├── apps/
│   ├── backend/                 # NestJS backend
│   │   ├── src/
│   │   │   ├── core/           # Domain & Application layer
│   │   │   │   ├── domain/     # Entities
│   │   │   │   └── application/ # Use cases & Ports
│   │   │   ├── infrastructure/ # Persistence, Cache, Messaging
│   │   │   └── interfaces/     # HTTP Controllers & DTOs
│   │   └── migrations/         # Database migrations
│   │
│   └── frontend/               # Next.js frontend
│       ├── components/         # React components
│       │   ├── dashboard/
│       │   ├── pools/
│       │   └── ui/
│       └── src/
│           ├── app/            # Next.js app routes
│           ├── hooks/          # Custom React hooks
│           ├── i18n/           # Internationalization
│           └── stores/         # Zustand stores
│
├── docs/                       # Documentation
└── tools/                      # Utilities & scripts
```

## 🔧 Development

### Database Migrations

```bash
# Generate migration after schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes (dev only)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Code Quality

```bash
# Lint all projects
pnpm nx run-many -t lint

# Format code
pnpm nx format:write

# Run tests
pnpm nx run-many -t test
```

### Build

```bash
# Build backend
pnpm nx build backend

# Build frontend
pnpm nx build frontend

# Build all
pnpm nx run-many -t build
```

## 🌐 API Endpoints

### Trading Orders

```
GET    /api/trading/orders       # Get all orders
POST   /api/trading/orders       # Create new order
```

### Liquidity Pools

```
GET    /api/pools                # Get all pools
  ?dex=dragonswap               # Filter by DEX
  ?isActive=true                # Filter by status

GET    /api/pools/:id/history   # Get pool historical data
  ?from=2025-01-01T00:00:00Z   # Start date
  ?to=2025-01-31T23:59:59Z     # End date
```

## 📊 Database Schema

### Orders Table
- Trading orders with status tracking
- Fields: asset_pair, side, quantity, price, status

### Liquidity Pools Table
- Pool information from DEXs
- Fields: pool_address, dex, tokens, tvl, volume, apr

### Pool History Table
- Time-series data for pools
- Fields: pool_id, timestamp, reserves, tvl, volume, price

## 🎯 Next Steps

### Data Ingestion ✅

Pool data is **automatically populated** via cron jobs:

1. ✅ **DragonSwap API Client** - Fetches pools from DragonSwap
2. ✅ **Sailor Finance API Client** - Fetches pools from Sailor Finance  
3. ✅ **Scheduled Sync Jobs** - Runs every 5 minutes automatically
4. ✅ **Historical Recording** - Records snapshots every 10 minutes

**How it works:**
- Backend starts → Immediate sync runs
- Every 5 minutes → Fetches latest pool data
- Every 10 minutes → Records historical snapshots
- Manual triggers available via admin API

See `docs/CRON_SYNC_SETUP.md` for configuration details.

### Current Status

**Implemented:**
- ✅ DEX data fetchers (DragonSwap & Sailor Finance)
- ✅ Automatic data synchronization (cron jobs)
- ✅ Pool filtering by DEX (frontend)
- ✅ Historical data tracking
- ✅ Interactive charts (TVL, Volume, Price)
- ✅ Multi-language support
- ✅ Swagger API documentation
- ✅ Helper scripts for development

**Future Enhancements:**
- [ ] Advanced pool search and sorting
- [ ] Notifications for pool changes (webhooks/email)
- [ ] Analytics dashboard (APR trends, performance)
- [ ] User authentication and favorites
- [ ] WebSocket for real-time updates
- [ ] Impermanent loss calculator
- [ ] Pool comparison tools

## 🧪 Testing

### Backend Tests

```bash
pnpm nx test backend
```

### Frontend Tests

```bash
pnpm nx test frontend
```

## 📦 Deployment

### Backend

```bash
# Build Docker image
docker build -f apps/backend/Dockerfile -t trading-bot-backend .

# Run container
docker run -p 3333:3333 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e RABBITMQ_URL=amqp://... \
  trading-bot-backend
```

### Frontend

```bash
# Build Docker image
docker build -f apps/frontend/Dockerfile -t trading-bot-frontend .

# Run container
docker run -p 4200:3000 \
  -e BACKEND_URL=http://backend:3333 \
  trading-bot-frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [documentation](./docs/)
- Review [Swagger API docs](http://localhost:3333/api/docs)
- Open an issue on GitHub

## 🙏 Acknowledgments

- Built with [Nx](https://nx.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Charts by [Recharts](https://recharts.org)

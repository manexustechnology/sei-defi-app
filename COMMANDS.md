# Quick Command Reference

This project uses **pnpm** as the package manager. Always use `pnpm` instead of `npm`.

## 📦 Package Management

```bash
# Install dependencies
pnpm install

# Add a dependency
pnpm add <package-name>

# Add a dev dependency
pnpm add -D <package-name>

# Remove a dependency
pnpm remove <package-name>
```

## 🚀 Running Applications

### Frontend (Next.js)
```bash
# Development mode
pnpm nx serve frontend

# Build for production
pnpm nx build frontend --configuration=production
```

### Backend (NestJS)
```bash
# Development mode
pnpm nx serve backend

# Build for production
pnpm nx build backend
```

## 🗄️ Database Commands

```bash
# First time setup (creates DB + runs migrations)
pnpm db:setup

# Generate new migration from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly (development only)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

## 🧪 Testing

```bash
# Frontend tests
pnpm nx test frontend

# Backend tests
pnpm nx test backend
```

## 🐳 Docker

```bash
# Build Docker images
pnpm nx run frontend:docker-build
pnpm nx run backend:docker-build
```

## 🔍 NX Commands

```bash
# View dependency graph
pnpm nx graph

# Run affected tests
pnpm nx affected:test

# Run affected builds
pnpm nx affected:build

# Clear NX cache
pnpm nx reset
```

## 🛠️ Other Tools

```bash
# Liquidity analysis
pnpm liquidity -- <subcommand>

# Example: Sailor market snapshot
pnpm liquidity -- sailor:query --query "{ pools(first: 5) { id } }"
```

## ⚠️ Important Notes

1. **Use `pnpm` not `npm`** - The project is configured for pnpm
2. **Use `pnpm nx` not `npx nx`** - For NX commands
3. The `.npmrc` file contains pnpm-specific configuration
4. Running with `npm` will show warnings about unknown configs

## 🔗 Quick Links

- Frontend: http://localhost:4200
- Backend: http://localhost:3333/api
- Swagger Docs: http://localhost:3333/api/docs
- Drizzle Studio: https://local.drizzle.studio (when running `pnpm db:studio`)


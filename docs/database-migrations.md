# Database Migrations Guide

This project uses **Drizzle ORM** with **Drizzle Kit** for database migrations.

## 📁 Migration Files Location

```
apps/backend/migrations/
├── 0000_clammy_warhawk.sql    # Initial migration (orders table)
├── meta/
│   ├── _journal.json           # Migration history
│   └── 0000_snapshot.json      # Schema snapshot
└── README.md                   # Migration directory documentation
```

## 🔧 Configuration

### Drizzle Config (`drizzle.config.ts`)

```typescript
{
  schema: './apps/backend/src/infrastructure/persistence/schema.ts',
  out: './apps/backend/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trading_bot',
  }
}
```

## 📝 Available Commands

### Generate New Migration
After modifying the schema, generate a migration:
```bash
pnpm db:generate
```

### Run Migrations
Apply pending migrations to the database:
```bash
pnpm db:migrate
```

This runs the programmatic migration script at `apps/backend/src/infrastructure/persistence/migrate.ts`

### Push Schema (Development Only)
Push schema changes directly without generating migrations:
```bash
pnpm db:push
```
⚠️ **Warning**: Use only in development. Not recommended for production.

### Open Drizzle Studio
Launch the visual database browser:
```bash
pnpm db:studio
```
Opens at `https://local.drizzle.studio`

### Drop Last Migration
Remove the most recent migration:
```bash
pnpm db:drop
```

## 🔄 Migration Workflow

### 1. Modify Schema
Edit `apps/backend/src/infrastructure/persistence/schema.ts`:

```typescript
export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey(),
  assetPair: text('asset_pair').notNull(),
  // ... add new columns here
});
```

### 2. Generate Migration
```bash
pnpm db:generate
```

This creates a new SQL file in `apps/backend/migrations/`

### 3. Review Migration
Check the generated SQL file to ensure it's correct:

```sql
-- Example: apps/backend/migrations/0001_new_feature.sql
ALTER TABLE "orders" ADD COLUMN "new_column" text;
```

### 4. Apply Migration
```bash
pnpm db:migrate
```

### 5. Commit to Version Control
```bash
git add apps/backend/migrations/
git commit -m "feat: add new column to orders table"
```

## 🌍 Environment Variables

Set `DATABASE_URL` in your `.env` file:

```bash
# Development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trading_bot

# Production
DATABASE_URL=postgresql://user:password@production-host:5432/trading_bot_prod
```

## 🏗️ Initial Migration

The project includes an initial migration that creates the `orders` table:

```sql
CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY NOT NULL,
  "asset_pair" text NOT NULL,
  "side" text NOT NULL,
  "quantity" numeric(20, 8) NOT NULL,
  "price" numeric(20, 8) NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
```

## 🚀 Production Deployment

### Option 1: Run Migration Script
```bash
DATABASE_URL="postgresql://..." pnpm db:migrate
```

### Option 2: Apply SQL Directly
```bash
psql $DATABASE_URL < apps/backend/migrations/0000_clammy_warhawk.sql
```

### Option 3: CI/CD Pipeline
Add to your deployment pipeline:
```yaml
- name: Run Database Migrations
  run: pnpm db:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 🔒 Best Practices

1. **Always review generated migrations** before applying them
2. **Test migrations** in a development environment first
3. **Keep migrations in version control**
4. **Never modify applied migrations** - create a new one instead
5. **Use `db:push` only in development** - never in production
6. **Backup database** before running migrations in production
7. **Run migrations** as part of your deployment process

## 🐛 Troubleshooting

### Migration Fails
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# View migration history
psql $DATABASE_URL -c "SELECT * FROM __drizzle_migrations"
```

### Reset Database (Development Only)
```bash
# Drop all tables
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations
pnpm db:migrate
```

### Conflicts
If you have migration conflicts:
1. Pull latest changes
2. Regenerate your migration: `pnpm db:generate`
3. Resolve any schema conflicts
4. Test the migration

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)


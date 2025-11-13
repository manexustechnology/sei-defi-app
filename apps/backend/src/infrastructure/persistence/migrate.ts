import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

/**
 * Run database migrations programmatically
 * Usage: pnpm db:migrate
 * Or: tsx apps/backend/src/infrastructure/persistence/migrate.ts
 */
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trading_bot';

  console.log('🔄 Starting database migration...');
  console.log(`📍 Database URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const db = drizzle(pool);

  try {
    await migrate(db, {
      migrationsFolder: './apps/backend/migrations',
    });

    console.log('✅ Database migration completed successfully!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message?.includes('does not exist')) {
      console.error('\n💡 Tip: Create the database first:');
      console.error('   psql -U postgres -c "CREATE DATABASE trading_bot;"');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();


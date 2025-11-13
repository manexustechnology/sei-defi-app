#!/bin/bash
set -e

# Database setup script for Manexus Onchain Trading Bot
# Creates the database if it doesn't exist and runs migrations

DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-trading_bot}

echo "🔧 Setting up database..."
echo "📍 Host: $DB_HOST:$DB_PORT"
echo "📁 Database: $DB_NAME"

# Check if PostgreSQL is accessible
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "📦 Creating database '$DB_NAME'..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Database created"
else
    echo "✓ Database already exists"
fi

# Export DATABASE_URL for migration
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo ""
echo "🔄 Running migrations..."
cd "$(dirname "$0")/../../.."
pnpm db:migrate

echo ""
echo "🎉 Database setup complete!"
echo "📝 Connection string: postgresql://$DB_USER:****@$DB_HOST:$DB_PORT/$DB_NAME"


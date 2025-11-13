#!/bin/bash

# Manexus Trading Bot - Quick Setup Script
# This script sets up your environment and prepares the system to run

set -e  # Exit on error

echo "🚀 Setting up Manexus Trading Bot..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${BLUE}ℹ️  .env file already exists${NC}"
fi

# 2. Check if PostgreSQL is running
echo ""
echo -e "${YELLOW}🔍 Checking PostgreSQL...${NC}"
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Please start it:${NC}"
    echo "   brew services start postgresql@14"
    echo "   # or"
    echo "   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres --name postgres postgres:14"
fi

# 3. Check if Redis is running
echo ""
echo -e "${YELLOW}🔍 Checking Redis...${NC}"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠️  Redis is not running. Please start it:${NC}"
    echo "   brew services start redis"
    echo "   # or"
    echo "   docker run -d -p 6379:6379 --name redis redis:7"
fi

# 4. Check if RabbitMQ is running
echo ""
echo -e "${YELLOW}🔍 Checking RabbitMQ...${NC}"
if curl -s http://localhost:15672 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RabbitMQ is running${NC}"
else
    echo -e "${YELLOW}⚠️  RabbitMQ is not running. Please start it:${NC}"
    echo "   brew services start rabbitmq"
    echo "   # or"
    echo "   docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management"
fi

# 5. Setup database
echo ""
echo -e "${YELLOW}📊 Setting up database...${NC}"
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw trading_bot; then
    echo -e "${BLUE}ℹ️  Database 'trading_bot' already exists${NC}"
else
    psql -U postgres -c "CREATE DATABASE trading_bot;" 2>/dev/null || true
fi

# 6. Run migrations
echo ""
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
pnpm db:migrate

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📚 Next steps:"
echo "   1. Start all services: ${BLUE}pnpm dev${NC}"
echo "   2. Backend will be at: ${BLUE}http://localhost:3333${NC}"
echo "   3. Frontend will be at: ${BLUE}http://localhost:4200${NC}"
echo "   4. Swagger docs at: ${BLUE}http://localhost:3333/api/docs${NC}"
echo ""


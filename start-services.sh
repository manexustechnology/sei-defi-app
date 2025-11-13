#!/bin/bash

# Start all required services for Manexus Trading Bot
# This script starts PostgreSQL, Redis, and RabbitMQ if not running

set -e

echo "🚀 Starting Manexus Trading Bot Services..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Start PostgreSQL
echo -e "${YELLOW}Starting PostgreSQL...${NC}"
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is already running${NC}"
else
    if command -v brew &> /dev/null; then
        brew services start postgresql@14 || brew services start postgresql
        echo -e "${GREEN}✅ PostgreSQL started${NC}"
    else
        echo "Please start PostgreSQL manually or use Docker:"
        echo "docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres --name postgres postgres:14"
    fi
fi

# Start Redis
echo ""
echo -e "${YELLOW}Starting Redis...${NC}"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is already running${NC}"
else
    if command -v brew &> /dev/null; then
        brew services start redis
        echo -e "${GREEN}✅ Redis started${NC}"
    else
        echo "Please start Redis manually or use Docker:"
        echo "docker run -d -p 6379:6379 --name redis redis:7"
    fi
fi

# Start RabbitMQ
echo ""
echo -e "${YELLOW}Starting RabbitMQ...${NC}"
if curl -s http://localhost:15672 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RabbitMQ is already running${NC}"
else
    if command -v brew &> /dev/null; then
        brew services start rabbitmq
        echo -e "${GREEN}✅ RabbitMQ started${NC}"
    else
        echo "Please start RabbitMQ manually or use Docker:"
        echo "docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management"
    fi
fi

echo ""
echo -e "${GREEN}✅ All services are ready!${NC}"
echo ""
echo "Services status:"
echo "  PostgreSQL: http://localhost:5432"
echo "  Redis: http://localhost:6379"
echo "  RabbitMQ: http://localhost:15672 (guest/guest)"
echo ""


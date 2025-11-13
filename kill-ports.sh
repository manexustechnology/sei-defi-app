#!/bin/bash

# Kill processes on ports used by the trading bot
# Useful when ports are stuck or processes didn't shut down cleanly

echo "🔧 Cleaning up ports..."

# Kill backend (port 3333)
if lsof -ti:3333 > /dev/null 2>&1; then
    echo "Killing process on port 3333 (backend)..."
    lsof -ti:3333 | xargs kill -9 2>/dev/null || true
    echo "✅ Port 3333 freed"
else
    echo "✓ Port 3333 is free"
fi

# Kill frontend (port 4200)
if lsof -ti:4200 > /dev/null 2>&1; then
    echo "Killing process on port 4200 (frontend)..."
    lsof -ti:4200 | xargs kill -9 2>/dev/null || true
    echo "✅ Port 4200 freed"
else
    echo "✓ Port 4200 is free"
fi

# Kill any nx serve processes
if pgrep -f "nx serve" > /dev/null 2>&1; then
    echo "Killing nx serve processes..."
    pkill -9 -f "nx serve" 2>/dev/null || true
    echo "✅ Nx serve processes killed"
else
    echo "✓ No nx serve processes running"
fi

# Kill Drizzle Studio (port 4983)
if lsof -ti:4983 > /dev/null 2>&1; then
    echo "Killing process on port 4983 (Drizzle Studio)..."
    lsof -ti:4983 | xargs kill -9 2>/dev/null || true
    echo "✅ Port 4983 freed"
fi

# Kill debugger (port 9229)
if lsof -ti:9229 > /dev/null 2>&1; then
    echo "Killing process on port 9229 (debugger)..."
    lsof -ti:9229 | xargs kill -9 2>/dev/null || true
    echo "✅ Port 9229 freed"
fi

echo ""
echo "✅ All ports cleaned up!"
echo ""


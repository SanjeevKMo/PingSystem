#!/bin/bash

# Quick setup script for Government Systems Monitoring Dashboard

echo "╔════════════════════════════════════════════╗"
echo "║  Government Systems Monitor - Setup       ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if MySQL is running
echo "1. Checking MySQL..."
if mysql -u root -e "SELECT 1" &>/dev/null; then
    echo "   ✓ MySQL is running"
else
    echo "   ✗ MySQL is not running. Please start MySQL first."
    echo "   Try: brew services start mysql"
    exit 1
fi

# Change to Backend directory
cd Backend

echo ""
echo "2. Installing dependencies..."
if npm install; then
    echo "   ✓ Dependencies installed"
else
    echo "   ✗ Failed to install dependencies"
    exit 1
fi

echo ""
echo "3. Initializing database..."
if node database/init-db.js; then
    echo "   ✓ Database initialized"
else
    echo "   ✗ Failed to initialize database"
    exit 1
fi

echo ""
echo "4. Setting up admin user..."
if node database/setup-admin.js; then
    echo "   ✓ Admin user created"
else
    echo "   ✗ Failed to create admin user"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║          Setup Complete! 🎉               ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Start backend:  npm run dev"
echo "  2. Open frontend:  Frontend/HTML/admin-login.html"
echo "  3. Login with:     admin / password123"
echo ""
echo "API Documentation:   BACKEND_SETUP.md"
echo "Quick Start Guide:   ../QUICK_START.md"
echo ""

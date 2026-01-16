#!/bin/bash

# FitFun Local Database Setup Script
# This script sets up a local PostgreSQL database for development

echo "🚀 FitFun Local Database Setup"
echo "================================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "Please install PostgreSQL:"
    echo "  macOS: brew install postgresql@14"
    echo "  Ubuntu: sudo apt-get install postgresql"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Database configuration
DB_NAME="fitfun_dev"
DB_USER="fitfun_user"
DB_PASSWORD="fitfun_dev_password"
DB_HOST="localhost"
DB_PORT="5432"

echo ""
echo "📦 Creating database: $DB_NAME"

# Create database and user
psql postgres << EOF
-- Drop existing database if it exists
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
else
    echo "❌ Failed to create database"
    exit 1
fi

echo ""
echo "📋 Running schema migrations..."

# Run schema
psql -U $DB_USER -d $DB_NAME -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema created successfully"
else
    echo "❌ Failed to create schema"
    exit 1
fi

echo ""
echo "🌱 Seeding database..."

# Run seed data
psql -U $DB_USER -d $DB_NAME -f database/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📝 Connection details:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""
echo "🔗 Connection string:"
echo "  DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "💡 Next steps:"
echo "  1. Copy .env.example to .env.local"
echo "  2. Update DATABASE_URL in .env.local"
echo "  3. Run: npm run dev"

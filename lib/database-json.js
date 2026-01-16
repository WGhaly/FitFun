const fs = require('fs');
const path = require('path');

// Determine if we're in production (Vercel) or local development
const isProduction = process.env.NODE_ENV === 'production' || process.env.POSTGRES_URL;

// Use Postgres in production, JSON file locally
let db;

if (isProduction) {
    // Production: Use Vercel Postgres
    const { sql } = require('@vercel/postgres');
    db = require('./database-postgres');
} else {
    // Local: Use JSON file database
    db = require('./database-json');
}

// Export the appropriate database implementation
module.exports = db;

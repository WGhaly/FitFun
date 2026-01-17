// FitFun Database Bridge (CommonJS)
// This file helps Node.js scripts resolve the correct database implementation

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL.includes('accelerate');

let Database;
let initDatabase = () => { }; // No-op for Postgres by default

if (isProduction) {
    // Production: Use Vercel Postgres via Prisma
    const postgres = require('./database-postgres');
    Database = postgres.Database;
} else {
    // Local: Use JSON file database
    const json = require('./database-json');
    Database = json.Database;
    initDatabase = json.initDatabase;
}

module.exports = { Database, initDatabase, isProduction };

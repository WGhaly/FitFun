// Determine if we're in production (Vercel) or local development
const isProduction = process.env.NODE_ENV === 'production' || process.env.POSTGRES_PRISMA_URL;

let db;

if (isProduction) {
    // Production: Use Vercel Postgres via Prisma
    db = require('./database-postgres');
} else {
    // Local: Use JSON file database
    db = require('./database-json');
}

// Export the appropriate database implementation
module.exports = db;

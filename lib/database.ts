// Determine if we're in production (Vercel) or local development
const isProduction = process.env.NODE_ENV === 'production' || process.env.POSTGRES_PRISMA_URL;

let Database: any;

if (isProduction) {
    // Production: Use Vercel Postgres via Prisma
    const postgres = require('./database-postgres');
    Database = postgres.Database;
} else {
    // Local: Use JSON file database
    const json = require('./database-json');
    Database = json.Database;
}

// Export the appropriate database implementation
export { Database };

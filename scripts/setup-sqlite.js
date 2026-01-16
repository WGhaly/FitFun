const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up SQLite database...\n');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database
const dbPath = path.join(dbDir, 'fitfun.db');
const db = new Database(dbPath);

console.log(`📦 Database file: ${dbPath}\n`);

// Read and execute schema
const schemaPath = path.join(__dirname, '..', 'database', 'schema-sqlite.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split by semicolon and execute each statement
const statements = schema.split(';').filter(stmt => stmt.trim());

console.log('📋 Creating tables...\n');

statements.forEach((statement, index) => {
    if (statement.trim()) {
        try {
            db.exec(statement);
            const match = statement.match(/CREATE\s+(?:TABLE|INDEX)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
            if (match) {
                console.log(`✅ Created: ${match[1]}`);
            }
        } catch (error) {
            console.error(`❌ Error executing statement ${index + 1}:`, error.message);
        }
    }
});

db.close();

console.log('\n✅ Database setup complete!');
console.log('\n💡 Next step: Run "npm run db:seed" to add demo data');

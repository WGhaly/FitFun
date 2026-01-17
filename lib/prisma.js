const { PrismaClient } = require('@prisma/client');

let prisma;

const prismaOptions = {
    accelerateUrl: process.env.DATABASE_URL
};

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient(prismaOptions);
} else {
    // Prevent multiple instances of Prisma Client in development
    if (!global.prisma) {
        global.prisma = new PrismaClient(prismaOptions);
    }
    prisma = global.prisma;
}

module.exports = prisma;

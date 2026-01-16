const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with Prisma...');

    const hashPassword = (password) => bcrypt.hashSync(password, 10);

    // 1. Create Super Admin
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@fitfun.com' },
        update: {},
        create: {
            email: 'admin@fitfun.com',
            passwordHash: hashPassword('Admin123!'),
            role: 'super_admin',
            name: 'Super Admin',
            mustResetPassword: false
        }
    });
    console.log('✅ Created super admin');

    // 2. Create Demo Users
    const user1 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            email: 'john@example.com',
            passwordHash: hashPassword('Password123!'),
            realName: 'John Doe',
            displayName: 'JohnD',
            weight: 85.0,
            height: 175.0,
            bmi: 27.8,
            country: 'United States',
            city: 'New York'
        }
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'sarah@example.com' },
        update: {},
        create: {
            email: 'sarah@example.com',
            passwordHash: hashPassword('Password123!'),
            realName: 'Sarah Smith',
            displayName: 'SarahFit',
            weight: 70.0,
            height: 165.0,
            bmi: 25.7,
            country: 'United States',
            city: 'Los Angeles'
        }
    });
    console.log('✅ Created demo users');

    // 3. Create Competition
    const competition = await prisma.competition.create({
        data: {
            name: 'Summer Weight Loss Challenge',
            description: 'Join us for a 12-week transformation journey!',
            creatorId: user1.id,
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            duration: 84,
            measurementMethod: 'percentage',
            prizeDescription: 'Winner gets a fitness tracker and gym membership!',
            winnerDistribution: '1st+2nd+3rd',
            status: 'upcoming',
            participants: {
                create: [
                    { userId: user1.id, approved: true },
                    { userId: user2.id, approved: true }
                ]
            }
        }
    });
    console.log('✅ Created competition and added participants');

    // 4. Create Testimonials
    await prisma.testimonial.create({
        data: {
            userId: user1.id,
            competitionId: competition.id,
            text: 'This competition completely changed my life! I lost 15kg and feel amazing.',
            weightLost: 15.0,
            status: 'pending'
        }
    });

    await prisma.testimonial.create({
        data: {
            userId: user2.id,
            competitionId: competition.id,
            text: 'Best decision I ever made! Down 10kg and counting!',
            weightLost: 10.0,
            status: 'approved',
            approvedById: admin.id,
            approvedAt: new Date()
        }
    });
    console.log('✅ Created testimonials');

    console.log('✨ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

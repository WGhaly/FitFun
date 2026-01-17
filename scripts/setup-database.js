const { Database, initDatabase, isProduction } = require('../lib/database');
const bcrypt = require('bcryptjs');

async function setup() {
    console.log('🚀 Setting up FitFun database...\n');
    console.log(`📡 Mode: ${isProduction ? 'Postgres' : 'JSON'}\n`);

    // Initialize database
    initDatabase();

    console.log('🌱 Seeding database...\n');

    // Hash password helper
    const hashPassword = (password) => bcrypt.hashSync(password, 10);

    try {
        // Create super admin
        const superAdmin = await Database.createAdmin({
            email: 'admin@fitfun.com',
            password_hash: hashPassword('Admin123!'),
            role: 'super_admin',
            name: 'Super Admin',
            must_reset_password: false
        });
        console.log('✅ Created super admin: admin@fitfun.com / Admin123!');

        // Create demo users
        const user1 = await Database.createUser({
            email: 'john@example.com',
            password_hash: hashPassword('Password123!'),
            role: 'user',
            real_name: 'John Doe',
            display_name: 'JohnD',
            weight: 85.0,
            height: 175.0,
            bmi: 27.8,
            country: 'United States',
            city: 'New York'
        });
        console.log('✅ Created user: john@example.com / Password123!');

        const user2 = await Database.createUser({
            email: 'sarah@example.com',
            password_hash: hashPassword('Password123!'),
            role: 'user',
            real_name: 'Sarah Smith',
            display_name: 'SarahFit',
            weight: 70.0,
            height: 165.0,
            bmi: 25.7,
            country: 'United States',
            city: 'Los Angeles'
        });
        console.log('✅ Created user: sarah@example.com / Password123!');

        // Create demo competition
        const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const competition = await Database.createCompetition({
            name: 'Summer Weight Loss Challenge',
            description: 'Join us for a 12-week transformation journey!',
            creator_id: user1.id,
            is_public: true,
            join_mode: 'free',
            max_participants: 50,
            start_date: startDate,
            duration: 84,
            measurement_method: 'percentage',
            prize_description: 'Winner gets a fitness tracker and gym membership!',
            winner_distribution: '1st+2nd+3rd',
            status: 'upcoming'
        });
        console.log('✅ Created competition: Summer Weight Loss Challenge');

        // Add participants
        await Database.addParticipant(competition.id, user1.id, true);
        await Database.addParticipant(competition.id, user2.id, true);
        console.log('✅ Added participants to competition');

        // Create testimonials
        await Database.createTestimonial({
            user_id: user1.id,
            competition_id: competition.id,
            text: 'This competition completely changed my life! I lost 15kg and feel amazing. The community support was incredible and kept me motivated throughout the journey.',
            weight_lost: 15.0
        });
        console.log('✅ Created pending testimonial');

        const approvedTest = await Database.createTestimonial({
            user_id: user2.id,
            competition_id: competition.id,
            text: 'Best decision I ever made! The structured approach and friendly competition helped me stay on track. Down 10kg and counting!',
            weight_lost: 10.0
        });

        // Approve the second testimonial
        await Database.updateTestimonial(approvedTest.id, {
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: superAdmin.id
        });
        console.log('✅ Created approved testimonial');

        console.log('\n✅ Database setup complete!');
        console.log('\n📝 Demo Credentials:');
        console.log('   Admin: admin@fitfun.com / Admin123!');
        console.log('   User 1: john@example.com / Password123!');
        console.log('   User 2: sarah@example.com / Password123!');
        console.log('\n💡 Next step: Run "npm run dev" to start the server');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
    }
}

setup();

const prisma = require('./prisma');

class Database {
    // Users
    static async createUser(userData) {
        return await prisma.user.create({
            data: {
                email: userData.email,
                passwordHash: userData.password_hash,
                role: userData.role || 'user',
                realName: userData.real_name,
                displayName: userData.display_name,
                weight: userData.weight,
                height: userData.height,
                bmi: userData.bmi,
                country: userData.country,
                city: userData.city
            }
        });
    }

    static async getUserByEmail(email) {
        return await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
    }

    static async getUserById(id) {
        return await prisma.user.findUnique({
            where: { id }
        });
    }

    static async getAllUsers() {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    static async updateUser(id, updates) {
        // Map updates to match Prisma schema fields if necessary
        const prismaUpdates = {};
        if (updates.email) prismaUpdates.email = updates.email;
        if (updates.password_hash) prismaUpdates.passwordHash = updates.password_hash;
        if (updates.role) prismaUpdates.role = updates.role;
        if (updates.real_name) prismaUpdates.realName = updates.real_name;
        if (updates.display_name) prismaUpdates.displayName = updates.display_name;
        if (updates.weight !== undefined) prismaUpdates.weight = updates.weight;
        if (updates.height !== undefined) prismaUpdates.height = updates.height;
        if (updates.bmi !== undefined) prismaUpdates.bmi = updates.bmi;
        if (updates.country) prismaUpdates.country = updates.country;
        if (updates.city) prismaUpdates.city = updates.city;

        return await prisma.user.update({
            where: { id },
            data: prismaUpdates
        });
    }

    static async deleteUser(id) {
        await prisma.user.delete({
            where: { id }
        });
    }

    // Admins
    static async createAdmin(adminData) {
        return await prisma.admin.create({
            data: {
                email: adminData.email,
                passwordHash: adminData.password_hash,
                role: adminData.role || 'admin',
                name: adminData.name,
                mustResetPassword: adminData.must_reset_password !== false,
                createdById: adminData.created_by || null
            }
        });
    }

    static async getAdminByEmail(email) {
        return await prisma.admin.findUnique({
            where: { email: email.toLowerCase() }
        });
    }

    static async getAllAdmins() {
        return await prisma.admin.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    static async updateAdmin(id, updates) {
        const prismaUpdates = {};
        if (updates.email) prismaUpdates.email = updates.email;
        if (updates.password_hash) prismaUpdates.passwordHash = updates.password_hash;
        if (updates.role) prismaUpdates.role = updates.role;
        if (updates.name) prismaUpdates.name = updates.name;
        if (updates.must_reset_password !== undefined) prismaUpdates.mustResetPassword = updates.must_reset_password;

        return await prisma.admin.update({
            where: { id },
            data: prismaUpdates
        });
    }

    static async deleteAdmin(id) {
        await prisma.admin.delete({
            where: { id }
        });
    }

    // Competitions
    static async createCompetition(competitionData) {
        return await prisma.competition.create({
            data: {
                name: competitionData.name,
                description: competitionData.description,
                creatorId: competitionData.creator_id,
                isPublic: competitionData.is_public !== false,
                joinMode: competitionData.join_mode || 'free',
                maxParticipants: competitionData.max_participants,
                startDate: new Date(competitionData.start_date),
                duration: competitionData.duration,
                measurementMethod: competitionData.measurement_method,
                prizeDescription: competitionData.prize_description,
                winnerDistribution: competitionData.winner_distribution || '1st',
                status: competitionData.status || 'upcoming'
            }
        });
    }

    static async getCompetitionById(id) {
        const competition = await prisma.competition.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                profileImage: true
                            }
                        }
                    }
                }
            }
        });

        if (!competition) return null;

        // Flatten participants for compatibility with frontend expectations
        return {
            ...competition,
            participants: competition.participants.map(p => ({
                userId: p.userId,
                status: p.status,
                joinedAt: p.joinedAt,
                ...p.user
            }))
        };
    }

    static async getAllCompetitions() {
        const competitions = await prisma.competition.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                participants: true
            }
        });

        // Map participants to just IDs or simple objects for the list view
        return competitions.map(c => ({
            ...c,
            participants: c.participants.map(p => p.userId)
        }));
    }

    static async getPublicCompetitions() {
        const competitions = await prisma.competition.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' },
            include: {
                participants: true
            }
        });

        return competitions.map(c => ({
            ...c,
            participants: c.participants.map(p => p.userId)
        }));
    }


    static async updateCompetition(id, updates) {
        const prismaUpdates = {};
        if (updates.name) prismaUpdates.name = updates.name;
        if (updates.description) prismaUpdates.description = updates.description;
        if (updates.is_public !== undefined) prismaUpdates.isPublic = updates.is_public;
        if (updates.status) prismaUpdates.status = updates.status;
        if (updates.winners) prismaUpdates.winners = updates.winners;

        return await prisma.competition.update({
            where: { id },
            data: prismaUpdates
        });
    }

    // Competition Participants
    static async addParticipant(competitionId, userId, approved = false) {
        return await prisma.competitionParticipant.create({
            data: {
                competitionId,
                userId,
                approved
            }
        });
    }

    static async getCompetitionParticipants(competitionId) {
        const participants = await prisma.competitionParticipant.findMany({
            where: { competitionId },
            include: {
                user: {
                    select: {
                        displayName: true,
                        realName: true,
                        email: true
                    }
                }
            }
        });

        // Flatten for compatibility
        return participants.map(p => ({
            ...p,
            display_name: p.user.displayName,
            real_name: p.user.realName,
            email: p.user.email
        }));
    }

    static async removeParticipant(competitionId, userId) {
        await prisma.competitionParticipant.delete({
            where: {
                competitionId_userId: {
                    competitionId,
                    userId
                }
            }
        });
    }

    // Measurements
    static async createMeasurement(measurementData) {
        return await prisma.measurement.create({
            data: {
                userId: measurementData.user_id,
                competitionId: measurementData.competition_id,
                weight: measurementData.weight,
                bodyFatPercentage: measurementData.body_fat_percentage,
                bmi: measurementData.bmi,
                measurementDate: new Date(measurementData.measurement_date)
            }
        });
    }

    static async getUserMeasurements(userId, competitionId = null) {
        const where = { userId };
        if (competitionId) {
            where.competitionId = competitionId;
        }

        return await prisma.measurement.findMany({
            where,
            orderBy: { measurementDate: 'desc' }
        });
    }

    static async updateMeasurement(id, updates) {
        const prismaUpdates = {};
        if (updates.weight !== undefined) prismaUpdates.weight = updates.weight;
        if (updates.body_fat_percentage !== undefined) prismaUpdates.bodyFatPercentage = updates.body_fat_percentage;
        if (updates.bmi !== undefined) prismaUpdates.bmi = updates.bmi;
        if (updates.measurement_date) prismaUpdates.measurementDate = new Date(updates.measurement_date);

        return await prisma.measurement.update({
            where: { id },
            data: prismaUpdates
        });
    }

    static async deleteMeasurement(id) {
        await prisma.measurement.delete({
            where: { id }
        });
    }

    // Testimonials
    static async createTestimonial(testimonialData) {
        return await prisma.testimonial.create({
            data: {
                userId: testimonialData.user_id,
                competitionId: testimonialData.competition_id,
                text: testimonialData.text,
                weightLost: testimonialData.weight_lost,
                status: 'pending'
            }
        });
    }

    static async getAllTestimonials() {
        const testimonials = await prisma.testimonial.findMany({
            include: {
                user: {
                    select: {
                        displayName: true,
                        realName: true
                    }
                },
                competition: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return testimonials.map(t => ({
            ...t,
            display_name: t.user.displayName,
            real_name: t.user.realName,
            competition_name: t.competition.name
        }));
    }

    static async getApprovedTestimonials() {
        const testimonials = await prisma.testimonial.findMany({
            where: { status: 'approved' },
            include: {
                user: {
                    select: {
                        displayName: true,
                        realName: true
                    }
                },
                competition: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return testimonials.map(t => ({
            ...t,
            display_name: t.user.displayName,
            real_name: t.user.realName,
            competition_name: t.competition.name
        }));
    }

    static async updateTestimonial(id, updates) {
        const prismaUpdates = {};
        if (updates.status) prismaUpdates.status = updates.status;
        if (updates.approved_at) prismaUpdates.approvedAt = new Date(updates.approved_at);
        if (updates.approved_by) prismaUpdates.approvedById = updates.approved_by;

        return await prisma.testimonial.update({
            where: { id },
            data: prismaUpdates
        });
    }

    static async deleteTestimonial(id) {
        await prisma.testimonial.delete({
            where: { id }
        });
    }

    // Notifications
    static async createNotification(notificationData) {
        return await prisma.notification.create({
            data: {
                userId: notificationData.user_id,
                type: notificationData.type,
                title: notificationData.title,
                message: notificationData.message,
                read: false
            }
        });
    }

    static async getUserNotifications(userId) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async markNotificationAsRead(id) {
        await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
    }
}

module.exports = { Database };

// FitFun Competition Management Module

const Competition = {
    // Create new competition
    create(competitionData, creatorId) {
        const competitions = stateManager.getState('competitions');

        // Validate required fields
        if (!competitionData.name || !competitionData.startDate || !competitionData.duration) {
            return {
                success: false,
                error: 'Competition name, start date, and duration are required'
            };
        }

        // Validate public competitions have max participants
        if (competitionData.isPublic && !competitionData.maxParticipants) {
            return {
                success: false,
                error: 'Public competitions must have a maximum participant limit'
            };
        }

        // Validate start date is in future
        if (Utils.isPast(competitionData.startDate)) {
            return {
                success: false,
                error: 'Start date must be in the future'
            };
        }

        // Create new competition
        const newCompetition = {
            id: Utils.generateId('comp'),
            name: competitionData.name,
            description: competitionData.description || '',
            creatorId: creatorId,
            isPublic: competitionData.isPublic || false,
            joinMode: competitionData.joinMode || 'free', // 'free' or 'approval'
            maxParticipants: competitionData.maxParticipants || null,
            startDate: competitionData.startDate,
            duration: competitionData.duration,
            measurementMethod: competitionData.measurementMethod || 'percentage',
            prizeDescription: competitionData.prizeDescription || '',
            winnerDistribution: competitionData.winnerDistribution || '1st',
            participants: [creatorId], // Creator automatically joins
            status: 'upcoming',
            createdAt: new Date().toISOString(),
            winners: null,
            joinRequests: []
        };

        competitions.push(newCompetition);
        stateManager.setState('competitions', competitions);

        // Create notification for creator
        this.createNotification(creatorId, {
            type: 'competition_created',
            title: 'Competition Created',
            message: `Your competition "${newCompetition.name}" has been created successfully`,
            competitionId: newCompetition.id
        });

        return {
            success: true,
            competition: newCompetition
        };
    },

    // Get competition by ID
    getById(competitionId) {
        const competitions = stateManager.getState('competitions');
        return competitions.find(c => c.id === competitionId);
    },

    // Get all competitions
    getAll() {
        return stateManager.getState('competitions');
    },

    // Get public active competitions
    getPublicActive() {
        const competitions = stateManager.getState('competitions');
        return competitions.filter(c =>
            c.isPublic &&
            (c.status === 'upcoming' || c.status === 'active')
        ).sort((a, b) => b.participants.length - a.participants.length); // Sort by popularity
    },

    // Get user's competitions
    getUserCompetitions(userId) {
        const competitions = stateManager.getState('competitions');
        return competitions.filter(c => c.participants.includes(userId));
    },

    // Join competition
    join(competitionId, userId) {
        const competitions = stateManager.getState('competitions');
        const compIndex = competitions.findIndex(c => c.id === competitionId);

        if (compIndex === -1) {
            return {
                success: false,
                error: 'Competition not found'
            };
        }

        const competition = competitions[compIndex];

        // Check if already a participant
        if (competition.participants.includes(userId)) {
            return {
                success: false,
                error: 'You are already a participant in this competition'
            };
        }

        // Check if competition has started
        if (competition.status !== 'upcoming') {
            return {
                success: false,
                error: 'Cannot join a competition that has already started'
            };
        }

        // Check if competition is full
        if (competition.maxParticipants && competition.participants.length >= competition.maxParticipants) {
            return {
                success: false,
                error: 'This competition is full'
            };
        }

        // Validate user profile completeness based on measurement method
        const validationResult = this.validateProfileCompleteness(userId, competition.measurementMethod);
        if (!validationResult.valid) {
            return {
                success: false,
                error: validationResult.error
            };
        }

        // If approval required, add to join requests
        if (competition.joinMode === 'approval') {
            if (!competition.joinRequests.includes(userId)) {
                competition.joinRequests.push(userId);
                competitions[compIndex] = competition;
                stateManager.setState('competitions', competitions);

                // Notify creator
                this.createNotification(competition.creatorId, {
                    type: 'join_request',
                    title: 'New Join Request',
                    message: `Someone wants to join "${competition.name}"`,
                    competitionId: competition.id,
                    userId: userId
                });

                return {
                    success: true,
                    requiresApproval: true
                };
            }
        }

        // Free join - add directly
        competition.participants.push(userId);
        competitions[compIndex] = competition;
        stateManager.setState('competitions', competitions);

        // Notify user
        this.createNotification(userId, {
            type: 'join_success',
            title: 'Joined Competition',
            message: `You have joined "${competition.name}"`,
            competitionId: competition.id
        });

        return {
            success: true,
            requiresApproval: false
        };
    },

    // Approve join request
    approveJoinRequest(competitionId, userId, approverId) {
        const competitions = stateManager.getState('competitions');
        const compIndex = competitions.findIndex(c => c.id === competitionId);

        if (compIndex === -1) {
            return {
                success: false,
                error: 'Competition not found'
            };
        }

        const competition = competitions[compIndex];

        // Check if approver is creator
        if (competition.creatorId !== approverId) {
            return {
                success: false,
                error: 'Only the competition creator can approve join requests'
            };
        }

        // Check if user has a pending request
        if (!competition.joinRequests.includes(userId)) {
            return {
                success: false,
                error: 'No pending join request from this user'
            };
        }

        // Remove from join requests and add to participants
        competition.joinRequests = competition.joinRequests.filter(id => id !== userId);
        competition.participants.push(userId);
        competitions[compIndex] = competition;
        stateManager.setState('competitions', competitions);

        // Notify user
        this.createNotification(userId, {
            type: 'join_approved',
            title: 'Join Request Approved',
            message: `Your request to join "${competition.name}" has been approved`,
            competitionId: competition.id
        });

        return {
            success: true
        };
    },

    // Reject join request
    rejectJoinRequest(competitionId, userId, rejecterId) {
        const competitions = stateManager.getState('competitions');
        const compIndex = competitions.findIndex(c => c.id === competitionId);

        if (compIndex === -1) {
            return {
                success: false,
                error: 'Competition not found'
            };
        }

        const competition = competitions[compIndex];

        // Check if rejecter is creator
        if (competition.creatorId !== rejecterId) {
            return {
                success: false,
                error: 'Only the competition creator can reject join requests'
            };
        }

        // Remove from join requests
        competition.joinRequests = competition.joinRequests.filter(id => id !== userId);
        competitions[compIndex] = competition;
        stateManager.setState('competitions', competitions);

        // Notify user
        this.createNotification(userId, {
            type: 'join_rejected',
            title: 'Join Request Rejected',
            message: `Your request to join "${competition.name}" was not approved`,
            competitionId: competition.id
        });

        return {
            success: true
        };
    },

    // Cancel competition
    cancel(competitionId, userId) {
        const competitions = stateManager.getState('competitions');
        const compIndex = competitions.findIndex(c => c.id === competitionId);

        if (compIndex === -1) {
            return {
                success: false,
                error: 'Competition not found'
            };
        }

        const competition = competitions[compIndex];
        const currentUser = stateManager.getCurrentUser();

        // Check if user is creator or admin
        const isCreator = competition.creatorId === userId;
        const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');

        if (!isCreator && !isAdmin) {
            return {
                success: false,
                error: 'Only the creator or an admin can cancel this competition'
            };
        }

        // Cancel competition
        competition.status = 'canceled';
        competitions[compIndex] = competition;
        stateManager.setState('competitions', competitions);

        // Notify all participants
        competition.participants.forEach(participantId => {
            this.createNotification(participantId, {
                type: 'competition_canceled',
                title: 'Competition Canceled',
                message: `"${competition.name}" has been canceled`,
                competitionId: competition.id
            });
        });

        return {
            success: true
        };
    },

    // Validate profile completeness for competition
    validateProfileCompleteness(userId, measurementMethod) {
        const users = stateManager.getState('users');
        const user = users.find(u => u.id === userId);

        if (!user) {
            return { valid: false, error: 'User not found' };
        }

        // Weight and height are always required
        if (!user.weight || !user.height) {
            return {
                valid: false,
                error: 'Please complete your profile with weight and height before joining'
            };
        }

        // Additional requirements based on measurement method
        if (measurementMethod === 'bmi' && !user.bmi) {
            return {
                valid: false,
                error: 'BMI is required for this competition. Please update your profile.'
            };
        }

        if (measurementMethod === 'bodyfat' && !user.bodyFatPercentage) {
            return {
                valid: false,
                error: 'Body fat percentage is required for this competition. Please update your profile.'
            };
        }

        return { valid: true };
    },

    // Update competition status (called periodically)
    updateStatuses() {
        const competitions = stateManager.getState('competitions');
        let updated = false;

        competitions.forEach(comp => {
            if (comp.status === 'canceled') return;

            const newStatus = Utils.getCompetitionStatus(comp);

            if (newStatus !== comp.status) {
                comp.status = newStatus;
                updated = true;

                // Notify participants of status changes
                if (newStatus === 'active') {
                    comp.participants.forEach(participantId => {
                        this.createNotification(participantId, {
                            type: 'competition_started',
                            title: 'Competition Started',
                            message: `"${comp.name}" has started!`,
                            competitionId: comp.id
                        });
                    });
                } else if (newStatus === 'grace_period') {
                    comp.participants.forEach(participantId => {
                        this.createNotification(participantId, {
                            type: 'competition_ended',
                            title: 'Competition Ended',
                            message: `"${comp.name}" has ended. You have 24 hours to finalize your measurements.`,
                            competitionId: comp.id
                        });
                    });
                } else if (newStatus === 'completed') {
                    // Calculate winners
                    this.calculateWinners(comp.id);
                }
            }
        });

        if (updated) {
            stateManager.setState('competitions', competitions);
        }
    },

    // Calculate winners
    calculateWinners(competitionId) {
        const competition = this.getById(competitionId);
        if (!competition) return;

        const measurements = stateManager.getState('measurements');
        const users = stateManager.getState('users');

        // Get all participants' measurements
        const participantResults = competition.participants.map(userId => {
            const user = users.find(u => u.id === userId);
            const userMeasurements = measurements.filter(m =>
                m.competitionId === competitionId && m.userId === userId
            ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            if (userMeasurements.length === 0) {
                return null;
            }

            const firstMeasurement = userMeasurements[0];
            const lastMeasurement = userMeasurements[userMeasurements.length - 1];

            let score = 0;

            switch (competition.measurementMethod) {
                case 'absolute':
                    score = Utils.calculateAbsoluteWeightLoss(firstMeasurement.weight, lastMeasurement.weight);
                    break;
                case 'percentage':
                    score = Utils.calculateWeightLossPercentage(firstMeasurement.weight, lastMeasurement.weight);
                    break;
                case 'bmi':
                    score = Utils.calculateBMIChange(firstMeasurement.bmi, lastMeasurement.bmi);
                    break;
                case 'bodyfat':
                    score = Utils.calculateBodyFatChange(firstMeasurement.bodyFatPercentage, lastMeasurement.bodyFatPercentage);
                    break;
            }

            return {
                userId,
                displayName: user.displayName,
                score
            };
        }).filter(r => r !== null);

        // Sort by score (descending)
        participantResults.sort((a, b) => b.score - a.score);

        // Determine winners based on distribution
        let winners = [];
        if (competition.winnerDistribution === '1st') {
            winners = participantResults.slice(0, 1);
        } else if (competition.winnerDistribution === '1st+2nd') {
            winners = participantResults.slice(0, 2);
        } else if (competition.winnerDistribution === '1st+2nd+3rd') {
            winners = participantResults.slice(0, 3);
        }

        // Update competition with winners
        const competitions = stateManager.getState('competitions');
        const compIndex = competitions.findIndex(c => c.id === competitionId);
        competitions[compIndex].winners = winners;
        competitions[compIndex].allResults = participantResults;
        stateManager.setState('competitions', competitions);

        // Notify winners
        winners.forEach((winner, index) => {
            this.createNotification(winner.userId, {
                type: 'competition_winner',
                title: 'Congratulations!',
                message: `You placed ${this.getOrdinal(index + 1)} in "${competition.name}"!`,
                competitionId: competition.id
            });
        });

        // Notify all participants that results are published
        competition.participants.forEach(participantId => {
            if (!winners.find(w => w.userId === participantId)) {
                this.createNotification(participantId, {
                    type: 'results_published',
                    title: 'Results Published',
                    message: `Results for "${competition.name}" are now available`,
                    competitionId: competition.id
                });
            }
        });
    },

    // Get ordinal number (1st, 2nd, 3rd, etc.)
    getOrdinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    },

    // Create notification
    createNotification(userId, notificationData) {
        const notifications = stateManager.getState('notifications');

        const notification = {
            id: Utils.generateId('notif'),
            userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            competitionId: notificationData.competitionId || null,
            relatedUserId: notificationData.userId || null,
            read: false,
            createdAt: new Date().toISOString()
        };

        notifications.push(notification);
        stateManager.setState('notifications', notifications);
    },

    // Get leaderboard
    getLeaderboard(competitionId) {
        const competition = this.getById(competitionId);
        if (!competition) return [];

        const measurements = stateManager.getState('measurements');
        const users = stateManager.getState('users');

        // Get current standings
        const standings = competition.participants.map(userId => {
            const user = users.find(u => u.id === userId);
            const userMeasurements = measurements.filter(m =>
                m.competitionId === competitionId && m.userId === userId
            ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            if (userMeasurements.length === 0) {
                return {
                    userId,
                    displayName: user.displayName,
                    profileImage: user.profileImage,
                    score: 0,
                    hasMeasurements: false
                };
            }

            const firstMeasurement = userMeasurements[0];
            const lastMeasurement = userMeasurements[userMeasurements.length - 1];

            let score = 0;

            switch (competition.measurementMethod) {
                case 'absolute':
                    score = Utils.calculateAbsoluteWeightLoss(firstMeasurement.weight, lastMeasurement.weight);
                    break;
                case 'percentage':
                    score = Utils.calculateWeightLossPercentage(firstMeasurement.weight, lastMeasurement.weight);
                    break;
                case 'bmi':
                    score = Utils.calculateBMIChange(firstMeasurement.bmi, lastMeasurement.bmi);
                    break;
                case 'bodyfat':
                    score = Utils.calculateBodyFatChange(firstMeasurement.bodyFatPercentage, lastMeasurement.bodyFatPercentage);
                    break;
            }

            return {
                userId,
                displayName: user.displayName,
                profileImage: user.profileImage,
                score,
                hasMeasurements: true,
                measurementCount: userMeasurements.length
            };
        });

        // Sort by score (descending)
        standings.sort((a, b) => b.score - a.score);

        // Add rank
        standings.forEach((standing, index) => {
            standing.rank = index + 1;
        });

        return standings;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Competition;
}

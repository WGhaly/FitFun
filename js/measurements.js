// FitFun Measurements Module

const Measurements = {
    // Submit measurement
    submit(measurementData) {
        const { competitionId, userId, weight, bmi, bodyFatPercentage, muscleMassPercentage } = measurementData;

        // Validate competition exists
        const competition = Competition.getById(competitionId);
        if (!competition) {
            return {
                success: false,
                error: 'Competition not found'
            };
        }

        // Check if user is a participant
        if (!competition.participants.includes(userId)) {
            return {
                success: false,
                error: 'You are not a participant in this competition'
            };
        }

        // Check if competition is active or in grace period
        if (competition.status !== 'active' && competition.status !== 'grace_period') {
            return {
                success: false,
                error: 'Measurements can only be submitted during active competitions or grace period'
            };
        }

        // Validate required fields based on measurement method
        if (!weight) {
            return {
                success: false,
                error: 'Weight is required'
            };
        }

        if (competition.measurementMethod === 'bmi' && !bmi) {
            return {
                success: false,
                error: 'BMI is required for this competition'
            };
        }

        if (competition.measurementMethod === 'bodyfat' && !bodyFatPercentage) {
            return {
                success: false,
                error: 'Body fat percentage is required for this competition'
            };
        }

        // Create measurement
        const measurements = stateManager.getState('measurements');

        const newMeasurement = {
            id: Utils.generateId('measure'),
            competitionId,
            userId,
            weight,
            bmi: bmi || Utils.calculateBMI(weight, stateManager.getState('users').find(u => u.id === userId).height),
            bodyFatPercentage: bodyFatPercentage || null,
            muscleMassPercentage: muscleMassPercentage || null,
            timestamp: new Date().toISOString(),
            editedAt: null
        };

        measurements.push(newMeasurement);
        stateManager.setState('measurements', measurements);

        return {
            success: true,
            measurement: newMeasurement
        };
    },

    // Edit measurement
    edit(measurementId, updates) {
        const measurements = stateManager.getState('measurements');
        const measurementIndex = measurements.findIndex(m => m.id === measurementId);

        if (measurementIndex === -1) {
            return {
                success: false,
                error: 'Measurement not found'
            };
        }

        const measurement = measurements[measurementIndex];
        const competition = Competition.getById(measurement.competitionId);

        if (!competition) {
            return {
                success: false,
                error: 'Competition not found'
            };
        }

        // Check if still within edit window (competition end + 24h grace period)
        const endDate = new Date(competition.startDate);
        endDate.setDate(endDate.getDate() + competition.duration);
        const graceEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

        if (new Date() > graceEndDate) {
            return {
                success: false,
                error: 'Edit period has expired. Measurements can only be edited until 24 hours after competition end.'
            };
        }

        // Update measurement
        measurements[measurementIndex] = {
            ...measurement,
            ...updates,
            editedAt: new Date().toISOString()
        };

        stateManager.setState('measurements', measurements);

        return {
            success: true,
            measurement: measurements[measurementIndex]
        };
    },

    // Get measurements for a user in a competition
    getUserMeasurements(userId, competitionId) {
        const measurements = stateManager.getState('measurements');
        return measurements
            .filter(m => m.userId === userId && m.competitionId === competitionId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    // Get all measurements for a competition
    getCompetitionMeasurements(competitionId) {
        const measurements = stateManager.getState('measurements');
        return measurements
            .filter(m => m.competitionId === competitionId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    // Get measurement frequency for a competition
    getMeasurementFrequency(competitionId) {
        const competition = Competition.getById(competitionId);
        if (!competition) return null;

        return Utils.calculateMeasurementFrequency(competition.duration);
    },

    // Get required measurement count
    getRequiredMeasurementCount(competitionId) {
        const competition = Competition.getById(competitionId);
        if (!competition) return 0;

        const frequency = Utils.calculateMeasurementFrequency(competition.duration);
        return Math.ceil(competition.duration / frequency);
    },

    // Check if user has submitted minimum required measurements
    hasMinimumMeasurements(userId, competitionId) {
        const userMeasurements = this.getUserMeasurements(userId, competitionId);
        const required = this.getRequiredMeasurementCount(competitionId);
        return userMeasurements.length >= required;
    },

    // Get measurement reminders for a user
    getMeasurementReminders(userId) {
        const competitions = Competition.getUserCompetitions(userId);
        const reminders = [];

        competitions.forEach(comp => {
            if (comp.status !== 'active') return;

            const userMeasurements = this.getUserMeasurements(userId, comp.id);
            const frequency = Utils.calculateMeasurementFrequency(comp.duration);

            // Check if it's time for next measurement
            if (userMeasurements.length === 0) {
                reminders.push({
                    competitionId: comp.id,
                    competitionName: comp.name,
                    message: 'Submit your first measurement',
                    urgent: true
                });
            } else {
                const lastMeasurement = userMeasurements[userMeasurements.length - 1];
                const daysSinceLastMeasurement = Utils.daysBetween(lastMeasurement.timestamp, new Date());

                if (daysSinceLastMeasurement >= frequency) {
                    reminders.push({
                        competitionId: comp.id,
                        competitionName: comp.name,
                        message: `It's time for your next measurement (every ${frequency} days)`,
                        urgent: daysSinceLastMeasurement > frequency + 2
                    });
                }
            }
        });

        return reminders;
    },

    // Get progress data for charts
    getProgressData(userId, competitionId) {
        const measurements = this.getUserMeasurements(userId, competitionId);

        return measurements.map(m => ({
            date: m.timestamp,
            weight: m.weight,
            bmi: m.bmi,
            bodyFatPercentage: m.bodyFatPercentage,
            muscleMassPercentage: m.muscleMassPercentage
        }));
    },

    // Get user's overall progress across all competitions
    getUserOverallProgress(userId) {
        const measurements = stateManager.getState('measurements');
        const userMeasurements = measurements
            .filter(m => m.userId === userId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (userMeasurements.length === 0) {
            return null;
        }

        const first = userMeasurements[0];
        const last = userMeasurements[userMeasurements.length - 1];

        return {
            startWeight: first.weight,
            currentWeight: last.weight,
            totalWeightLoss: Utils.calculateAbsoluteWeightLoss(first.weight, last.weight),
            percentageLoss: Utils.calculateWeightLossPercentage(first.weight, last.weight),
            startBMI: first.bmi,
            currentBMI: last.bmi,
            bmiChange: Utils.calculateBMIChange(first.bmi, last.bmi),
            measurementCount: userMeasurements.length,
            firstMeasurementDate: first.timestamp,
            lastMeasurementDate: last.timestamp
        };
    },

    // Delete measurement
    delete(measurementId, userId) {
        const measurements = stateManager.getState('measurements');
        const measurement = measurements.find(m => m.id === measurementId);

        if (!measurement) {
            return {
                success: false,
                error: 'Measurement not found'
            };
        }

        // Check if user owns this measurement
        if (measurement.userId !== userId) {
            return {
                success: false,
                error: 'You can only delete your own measurements'
            };
        }

        const competition = Competition.getById(measurement.competitionId);
        if (!competition) {
            return {
                success: false,
                error: 'Competition not found'
            };
        }

        // Check if still within edit window
        const endDate = new Date(competition.startDate);
        endDate.setDate(endDate.getDate() + competition.duration);
        const graceEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

        if (new Date() > graceEndDate) {
            return {
                success: false,
                error: 'Measurements can only be deleted until 24 hours after competition end.'
            };
        }

        // Delete measurement
        const updatedMeasurements = measurements.filter(m => m.id !== measurementId);
        stateManager.setState('measurements', updatedMeasurements);

        return {
            success: true
        };
    },

    // Get statistics for a competition
    getCompetitionStatistics(competitionId) {
        const competition = Competition.getById(competitionId);
        if (!competition) return null;

        const measurements = this.getCompetitionMeasurements(competitionId);
        const users = stateManager.getState('users');

        // Calculate average weight loss
        const participantProgress = competition.participants.map(userId => {
            const userMeasurements = measurements
                .filter(m => m.userId === userId)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            if (userMeasurements.length < 2) return null;

            const first = userMeasurements[0];
            const last = userMeasurements[userMeasurements.length - 1];

            return {
                userId,
                weightLoss: Utils.calculateAbsoluteWeightLoss(first.weight, last.weight),
                percentageLoss: Utils.calculateWeightLossPercentage(first.weight, last.weight)
            };
        }).filter(p => p !== null);

        if (participantProgress.length === 0) {
            return {
                participantCount: competition.participants.length,
                activeParticipants: 0,
                averageWeightLoss: 0,
                averagePercentageLoss: 0,
                totalMeasurements: 0
            };
        }

        const totalWeightLoss = participantProgress.reduce((sum, p) => sum + p.weightLoss, 0);
        const totalPercentageLoss = participantProgress.reduce((sum, p) => sum + p.percentageLoss, 0);

        return {
            participantCount: competition.participants.length,
            activeParticipants: participantProgress.length,
            averageWeightLoss: Math.round((totalWeightLoss / participantProgress.length) * 10) / 10,
            averagePercentageLoss: Math.round((totalPercentageLoss / participantProgress.length) * 100) / 100,
            totalMeasurements: measurements.length,
            topPerformer: participantProgress.sort((a, b) => b.percentageLoss - a.percentageLoss)[0]
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Measurements;
}

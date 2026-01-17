// FitFun Measurements Module

const Measurements = {
    // Submit measurement
    async submit(measurementData) {
        try {
            const data = await API.measurements.submit(measurementData);
            if (data.success) {
                await stateManager.syncWithBackend();
                return { success: true, measurement: data.data };
            }
            return { success: false, error: data.error || 'Submission failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Edit measurement
    async edit(measurementId, updates) {
        try {
            // We'll need a generic update method in API or specific one
            // For now assuming API.measurements.update exists or we add it
            const data = await API.measurements.update(measurementId, updates);
            if (data.success) {
                await stateManager.syncWithBackend();
                return { success: true, measurement: data.data };
            }
            return { success: false, error: data.error || 'Update failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Delete measurement
    async delete(measurementId) {
        try {
            const data = await API.measurements.delete(measurementId);
            if (data.success) {
                await stateManager.syncWithBackend();
                return { success: true };
            }
            return { success: false, error: data.error || 'Deletion failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get measurements for a user in a competition (from state)
    getUserMeasurements(userId, competitionId) {
        const measurements = stateManager.getState('measurements');
        return measurements
            .filter(m => m.userId === userId && m.competitionId === competitionId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    // Get all measurements for a competition (from state)
    getCompetitionMeasurements(competitionId) {
        const measurements = stateManager.getState('measurements');
        return measurements
            .filter(m => m.competitionId === competitionId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    // Get statistics for a competition (Synchronous from state)
    getCompetitionStatistics(competitionId) {
        const competitions = stateManager.getState('competitions');
        const competition = competitions.find(c => c.id === competitionId);
        if (!competition) return null;

        const measurements = this.getCompetitionMeasurements(competitionId);

        // Backend handles complex stats, but we can do basic ones for UI
        const participants = competition.participants || [];

        return {
            participantCount: participants.length,
            totalMeasurements: measurements.length,
            // Add more stats as needed from state
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Measurements;
}

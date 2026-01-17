// FitFun Competition Management Module

const Competition = {
    // Create new competition
    async create(competitionData) {
        try {
            const data = await API.competitions.create(competitionData);
            if (data.success) {
                // The backend handles notification creation
                await stateManager.syncWithBackend();
                return { success: true, competition: data.data };
            }
            return { success: false, error: data.error || 'Creation failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get competition by ID
    async getById(id) {
        try {
            const data = await API.competitions.getById(id);
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error fetching competition:', error);
            return null;
        }
    },

    // Get all competitions (from state or API)
    getAll() {
        return stateManager.getState('competitions');
    },

    // Get public active competitions
    getPublicActive() {
        const competitions = stateManager.getState('competitions');
        return competitions.filter(c =>
            c.isPublic &&
            (c.status === 'upcoming' || c.status === 'active')
        ).sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));
    },

    // Get user's competitions
    getUserCompetitions(userId) {
        const competitions = stateManager.getState('competitions');
        return competitions.filter(c => c.participants && c.participants.includes(userId));
    },

    // Join competition
    async join(competitionId) {
        try {
            const data = await API.competitions.join(competitionId);
            if (data.success) {
                await stateManager.syncWithBackend();
                return { success: true, requiresApproval: data.requiresApproval };
            }
            return { success: false, error: data.error || 'Join failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update statuses (Helper for UI, though backend handles the logic)
    async updateStatuses() {
        await stateManager.syncWithBackend();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Competition;
}

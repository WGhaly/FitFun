// FitFun Testimonials Module

const Testimonials = {
    // Get all testimonials (admin)
    async getAll() {
        try {
            const data = await API.testimonials.getAll();
            return data.success ? data.testimonials : [];
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            return [];
        }
    },

    // Get approved testimonials
    async getApproved() {
        try {
            const data = await API.testimonials.getApproved();
            return data.success ? data.testimonials : [];
        } catch (error) {
            console.error('Error fetching approved testimonials:', error);
            return [];
        }
    },

    // Create testimonial
    async create(testimonialData) {
        try {
            const data = await API.testimonials.create(testimonialData);
            if (data.success) {
                await stateManager.syncWithBackend();
                return { success: true, testimonial: data.testimonial };
            }
            return { success: false, error: data.error || 'Submission failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update status (Approve/Hide)
    async updateStatus(id, status) {
        try {
            const data = await API.testimonials.updateStatus(id, status);
            if (data.success) {
                await stateManager.syncWithBackend();
                return { success: true };
            }
            return { success: false, error: data.error || 'Update failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Delete testimonial
    async delete(id) {
        try {
            // Need API.testimonials.delete
            const data = await API.request(`/testimonials/${id}`, { method: 'DELETE' });
            if (data.success) {
                await stateManager.syncWithBackend();
                return { success: true };
            }
            return { success: false, error: data.error || 'Deletion failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Testimonials;
}

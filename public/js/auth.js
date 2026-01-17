// FitFun Authentication Module

const Auth = {
    // User Registration
    async register(userData) {
        try {
            const data = await API.auth.register(userData);
            if (data.success) {
                stateManager.setSession(data.user);
                return { success: true, user: data.user };
            }
            return { success: false, error: data.error || 'Registration failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // User Login
    async login(email, password) {
        try {
            const data = await API.auth.login(email, password);
            if (data.success) {
                stateManager.setSession(data.user);
                return { success: true, user: data.user };
            }
            return { success: false, error: data.error || 'Login failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Admin Login
    async adminLogin(email, password) {
        try {
            const data = await API.auth.adminLogin(email, password);
            if (data.success) {
                stateManager.setSession(data.user);
                return { success: true, user: data.user };
            }
            return { success: false, error: data.error || 'Admin login failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        return stateManager.isAuthenticated();
    },

    // Get current user
    getCurrentUser() {
        return stateManager.getCurrentUser();
    },

    // Check if current user is admin
    isAdmin() {
        return stateManager.isAdmin();
    },

    // Logout
    async logout() {
        try {
            await API.auth.logout();
        } finally {
            stateManager.clearSession();
            window.location.href = '/public/pages/auth/login.html';
        }
        return { success: true };
    },

    // Update user profile
    async updateProfile(userId, updates) {
        try {
            const data = await API.profile.update(updates);
            if (data.success) {
                stateManager.setState('currentUser', data.user);
                return { success: true, user: data.user };
            }
            return { success: false, error: data.error || 'Update failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}

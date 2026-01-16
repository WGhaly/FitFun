// FitFun Authentication Module

const Auth = {
    // User Registration
    register(userData) {
        const users = stateManager.getState('users');

        // Check if email already exists
        const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existingUser) {
            return {
                success: false,
                error: 'An account with this email already exists'
            };
        }

        // Validate email
        if (!Utils.validateEmail(userData.email)) {
            return {
                success: false,
                error: 'Please enter a valid email address'
            };
        }

        // Validate password
        if (!Utils.validatePassword(userData.password)) {
            return {
                success: false,
                error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
            };
        }

        // Validate required fields
        if (!userData.realName || !userData.displayName) {
            return {
                success: false,
                error: 'Real name and display name are required'
            };
        }

        // Create new user
        const newUser = {
            id: Utils.generateId('user'),
            email: userData.email,
            password: userData.password, // In production, this would be hashed
            role: 'user',
            realName: userData.realName,
            displayName: userData.displayName,
            profileImage: userData.profileImage || null,
            weight: userData.weight || null,
            height: userData.height || null,
            bmi: userData.weight && userData.height ? Utils.calculateBMI(userData.weight, userData.height) : null,
            bodyFatPercentage: userData.bodyFatPercentage || null,
            muscleMassPercentage: userData.muscleMassPercentage || null,
            beforeImage: null,
            afterImage: null,
            createdAt: new Date().toISOString(),
            country: userData.country || null,
            city: userData.city || null
        };

        // Add user to state
        users.push(newUser);
        stateManager.setState('users', users);

        // Auto-login after registration
        stateManager.setSession(newUser);

        return {
            success: true,
            user: newUser
        };
    },

    // User Login
    login(email, password) {
        const users = stateManager.getState('users');

        // Find user
        const user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        );

        if (!user) {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }

        // Set session
        stateManager.setSession(user);

        return {
            success: true,
            user: user
        };
    },

    // Admin Login
    adminLogin(email, password) {
        const admins = stateManager.getState('admins');

        // Find admin
        const admin = admins.find(a =>
            a.email.toLowerCase() === email.toLowerCase() &&
            a.password === password
        );

        if (!admin) {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }

        // Check if password reset is required
        if (admin.mustResetPassword) {
            return {
                success: false,
                message: 'Password reset required',
                requiresPasswordReset: true,
                admin: admin
            };
        }

        // Set session
        stateManager.setSession(admin);

        return {
            success: true,
            user: admin
        };
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

    // Check if current user is super admin
    isSuperAdmin() {
        return stateManager.isSuperAdmin();
    },

    // Logout
    logout() {
        stateManager.clearSession();
        return { success: true };
    },

    // Reset admin password (for first login)
    resetAdminPassword(email, newPassword) {
        const users = stateManager.getState('users');
        const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

        if (userIndex === -1) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        if (!Utils.validatePassword(newPassword)) {
            return {
                success: false,
                message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
            };
        }

        // Update password and clear reset flag
        users[userIndex].password = newPassword;
        users[userIndex].requiresPasswordReset = false;
        stateManager.setState('users', users);

        // Update session
        stateManager.setSession(users[userIndex]);

        return {
            success: true
        };
    },

    // Update user profile
    updateProfile(userId, updates) {
        const users = stateManager.getState('users');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return {
                success: false,
                error: 'User not found'
            };
        }

        // Email cannot be changed
        if (updates.email && updates.email !== users[userIndex].email) {
            return {
                success: false,
                error: 'Email cannot be changed after registration'
            };
        }

        // Update BMI if weight or height changed
        if (updates.weight || updates.height) {
            const weight = updates.weight || users[userIndex].weight;
            const height = updates.height || users[userIndex].height;
            updates.bmi = Utils.calculateBMI(weight, height);
        }

        // Update user
        users[userIndex] = {
            ...users[userIndex],
            ...updates
        };

        stateManager.setState('users', users);

        // Update current user if it's the same user
        const currentUser = stateManager.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            stateManager.state.currentUser = users[userIndex];
            stateManager.saveToStorage();
        }

        return {
            success: true,
            user: users[userIndex]
        };
    },

    // Change password
    changePassword(userId, currentPassword, newPassword) {
        const users = stateManager.getState('users');
        const user = users.find(u => u.id === userId);

        if (!user) {
            return {
                success: false,
                error: 'User not found'
            };
        }

        if (user.password !== currentPassword) {
            return {
                success: false,
                error: 'Current password is incorrect'
            };
        }

        if (!Utils.validatePassword(newPassword)) {
            return {
                success: false,
                error: 'New password must be at least 8 characters with uppercase, lowercase, and number'
            };
        }

        // Update password
        const userIndex = users.findIndex(u => u.id === userId);
        users[userIndex].password = newPassword;
        stateManager.setState('users', users);

        return {
            success: true
        };
    },

    // Reset admin password (for first login or admin-initiated reset)
    resetAdminPassword(adminId, newPassword) {
        const admins = stateManager.getState('admins');
        const adminIndex = admins.findIndex(a => a.id === adminId);

        if (adminIndex === -1) {
            return {
                success: false,
                error: 'Admin not found'
            };
        }

        if (!Utils.validatePassword(newPassword)) {
            return {
                success: false,
                error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
            };
        }

        // Update password and clear reset flag
        admins[adminIndex].password = newPassword;
        admins[adminIndex].mustResetPassword = false;
        stateManager.setState('admins', admins);

        // Update session
        const currentUser = stateManager.getCurrentUser();
        if (currentUser && currentUser.id === adminId) {
            stateManager.state.currentUser = admins[adminIndex];
            stateManager.saveToStorage();
        }

        return {
            success: true
        };
    },

    // Delete user account
    deleteAccount(userId) {
        const users = stateManager.getState('users');
        const competitions = stateManager.getState('competitions');
        const measurements = stateManager.getState('measurements');

        const user = users.find(u => u.id === userId);
        if (!user) {
            return {
                success: false,
                error: 'User not found'
            };
        }

        // Handle cascade logic
        competitions.forEach(comp => {
            // If user is creator, transfer to next participant
            if (comp.creatorId === userId) {
                const otherParticipants = comp.participants.filter(p => p !== userId);
                if (otherParticipants.length > 0) {
                    comp.creatorId = otherParticipants[0];
                } else {
                    // No other participants, mark as canceled
                    comp.status = 'canceled';
                }
            }

            // Remove user from participants
            comp.participants = comp.participants.filter(p => p !== userId);
        });

        // Anonymize measurements (keep data but remove user reference)
        measurements.forEach(m => {
            if (m.userId === userId) {
                m.userId = 'deleted_user';
                m.anonymized = true;
            }
        });

        // Remove user
        const updatedUsers = users.filter(u => u.id !== userId);

        // Update state
        stateManager.setState('users', updatedUsers);
        stateManager.setState('competitions', competitions);
        stateManager.setState('measurements', measurements);

        // Clear session if deleting current user
        const currentUser = stateManager.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            stateManager.clearSession();
        }

        return {
            success: true
        };
    },

    // Create admin (Super Admin only)
    createAdmin(adminData, creatorId) {
        const creator = stateManager.getState('admins').find(a => a.id === creatorId);

        if (!creator || creator.role !== 'super_admin') {
            return {
                success: false,
                error: 'Only Super Admin can create admins'
            };
        }

        const admins = stateManager.getState('admins');

        // Check if email already exists
        const existing = admins.find(a => a.email.toLowerCase() === adminData.email.toLowerCase());
        if (existing) {
            return {
                success: false,
                error: 'An admin with this email already exists'
            };
        }

        // Generate random password
        const autoPassword = this.generateRandomPassword();

        // Create new admin
        const newAdmin = {
            id: Utils.generateId('admin'),
            email: adminData.email,
            password: autoPassword,
            role: 'admin',
            name: adminData.name,
            createdAt: new Date().toISOString(),
            createdBy: creatorId,
            mustResetPassword: true
        };

        admins.push(newAdmin);
        stateManager.setState('admins', admins);

        return {
            success: true,
            admin: newAdmin,
            temporaryPassword: autoPassword
        };
    },

    // Generate random password
    generateRandomPassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';

        // Ensure at least one of each required character type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    },

    // Initiate admin password reset (by Super Admin)
    initiateAdminPasswordReset(adminId, initiatorId) {
        const initiator = stateManager.getState('admins').find(a => a.id === initiatorId);

        if (!initiator || initiator.role !== 'super_admin') {
            return {
                success: false,
                error: 'Only Super Admin can reset admin passwords'
            };
        }

        const admins = stateManager.getState('admins');
        const adminIndex = admins.findIndex(a => a.id === adminId);

        if (adminIndex === -1) {
            return {
                success: false,
                error: 'Admin not found'
            };
        }

        // Generate new password
        const newPassword = this.generateRandomPassword();

        // Update admin
        admins[adminIndex].password = newPassword;
        admins[adminIndex].mustResetPassword = true;
        stateManager.setState('admins', admins);

        return {
            success: true,
            temporaryPassword: newPassword
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}

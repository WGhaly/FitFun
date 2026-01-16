// FitFun State Management
// Central state management using localStorage for persistence

class StateManager {
  constructor() {
    this.state = {
      currentUser: null,
      users: [],
      competitions: [],
      measurements: [],
      notifications: [],
      testimonials: [],
      admins: [],
      session: null
    };

    this.listeners = {};
    this.loadFromStorage();
  }

  // Load state from localStorage
  loadFromStorage() {
    try {
      const savedState = localStorage.getItem('fitfun_state');
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.initializeDefaultData();
      }
    } catch (error) {
      console.error('Error loading state:', error);
      this.initializeDefaultData();
    }
  }

  // Save state to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('fitfun_state', JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  // Initialize with default/demo data
  initializeDefaultData() {
    // Create super admin
    const superAdmin = {
      id: 'admin_1',
      email: 'admin@fitfun.com',
      password: 'Admin123!', // In production, this would be hashed
      role: 'super_admin',
      name: 'Super Admin',
      createdAt: new Date().toISOString(),
      mustResetPassword: false
    };

    // Create demo users
    const demoUsers = [
      {
        id: 'user_1',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'user',
        realName: 'John Doe',
        displayName: 'JohnD',
        profileImage: null,
        weight: 85,
        height: 175,
        bmi: null,
        bodyFatPercentage: null,
        muscleMassPercentage: null,
        beforeImage: null,
        afterImage: null,
        createdAt: new Date().toISOString(),
        country: 'United States',
        city: 'New York'
      },
      {
        id: 'user_2',
        email: 'sarah@example.com',
        password: 'Password123!',
        role: 'user',
        realName: 'Sarah Smith',
        displayName: 'SarahFit',
        profileImage: null,
        weight: 70,
        height: 165,
        bmi: null,
        bodyFatPercentage: null,
        muscleMassPercentage: null,
        beforeImage: null,
        afterImage: null,
        createdAt: new Date().toISOString(),
        country: 'United States',
        city: 'Los Angeles'
      }
    ];

    // Create demo competition
    const demoCompetition = {
      id: 'comp_1',
      name: 'Summer Weight Loss Challenge',
      description: 'Join us for a 12-week transformation journey!',
      creatorId: 'user_1',
      isPublic: true,
      joinMode: 'free', // 'free' or 'approval'
      maxParticipants: 50,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      duration: 84, // days
      measurementMethod: 'percentage', // 'absolute', 'percentage', 'bmi', 'bodyfat'
      prizeDescription: 'Winner gets a fitness tracker and gym membership!',
      winnerDistribution: '1st+2nd+3rd', // '1st', '1st+2nd', '1st+2nd+3rd'
      participants: ['user_1', 'user_2'],
      status: 'upcoming', // 'upcoming', 'active', 'grace_period', 'completed', 'canceled'
      createdAt: new Date().toISOString(),
      winners: null,
      joinRequests: []
    };

    // Create demo testimonials
    const demoTestimonials = [
      {
        id: 'test_1',
        userId: 'user_1',
        competitionId: 'comp_1',
        text: 'This competition completely changed my life! I lost 15kg and feel amazing. The community support was incredible and kept me motivated throughout the journey.',
        status: 'pending', // 'pending', 'approved', 'hidden'
        weightLost: 15,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'test_2',
        userId: 'user_2',
        competitionId: 'comp_1',
        text: 'Best decision I ever made! The structured approach and friendly competition helped me stay on track. Down 10kg and counting!',
        status: 'approved',
        weightLost: 10,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'admin_1'
      }
    ];

    this.state = {
      currentUser: null,
      users: demoUsers,
      competitions: [demoCompetition],
      measurements: [],
      notifications: [],
      testimonials: demoTestimonials,
      admins: [superAdmin],
      session: null
    };

    this.saveToStorage();
  }

  // Get state
  getState(key) {
    return key ? this.state[key] : this.state;
  }

  // Set state
  setState(key, value) {
    this.state[key] = value;
    this.saveToStorage();
    this.notifyListeners(key);
  }

  // Update nested state
  updateState(key, updater) {
    if (typeof updater === 'function') {
      this.state[key] = updater(this.state[key]);
    } else {
      this.state[key] = { ...this.state[key], ...updater };
    }
    this.saveToStorage();
    this.notifyListeners(key);
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  // Notify listeners of state changes
  notifyListeners(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(this.state[key]));
    }
  }

  // Clear all data (for testing)
  clearAll() {
    localStorage.removeItem('fitfun_state');
    this.initializeDefaultData();
  }

  // Session management
  setSession(user) {
    this.state.session = {
      userId: user.id,
      role: user.role,
      loginTime: new Date().toISOString()
    };
    this.state.currentUser = user;
    this.saveToStorage();
  }

  clearSession() {
    this.state.session = null;
    this.state.currentUser = null;
    this.saveToStorage();
  }

  getSession() {
    return this.state.session;
  }

  getCurrentUser() {
    return this.state.currentUser;
  }

  isAuthenticated() {
    return this.state.session !== null;
  }

  isAdmin() {
    return this.state.session && (this.state.session.role === 'admin' || this.state.session.role === 'super_admin');
  }

  isSuperAdmin() {
    return this.state.session && this.state.session.role === 'super_admin';
  }
}

// Create singleton instance
const stateManager = new StateManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = stateManager;
}

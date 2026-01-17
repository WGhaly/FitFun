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
    this.loadSessionFromStorage();
  }

  // Load basic session from localStorage for immediate UI shell
  loadSessionFromStorage() {
    try {
      const savedUser = localStorage.getItem('fitfun_user');
      const savedSession = localStorage.getItem('fitfun_session');
      if (savedUser && savedSession) {
        this.state.currentUser = JSON.parse(savedUser);
        this.state.session = JSON.parse(savedSession);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }

  // Sync full state from backend
  async syncWithBackend() {
    try {
      // Check auth status first
      const me = await API.auth.getMe().catch(() => null);
      if (me && me.success) {
        this.setSession(me.user);

        // Parallel fetch secondary data
        const [competitions, testimonials, measurements, notifications] = await Promise.all([
          API.competitions.getAll().catch(() => ({ success: false, competitions: [] })),
          API.testimonials.getApproved().catch(() => ({ success: false, testimonials: [] })),
          API.measurements.getAll().catch(() => ({ success: false, measurements: [] })),
          API.request('/notifications').catch(() => ({ success: false, notifications: [] }))
        ]);

        if (competitions.success) this.setState('competitions', competitions.competitions || []);
        if (testimonials.success) this.setState('testimonials', testimonials.testimonials || []);
        if (measurements.success) this.setState('measurements', measurements.measurements || []);
        if (notifications.success) this.setState('notifications', notifications.notifications || []);

        // If admin, fetch admin-only data
        if (this.isAdmin()) {
          const [users, admins] = await Promise.all([
            API.request('/admin/users').catch(() => ({ success: false, users: [] })),
            API.request('/admin/admins').catch(() => ({ success: false, admins: [] }))
          ]);
          if (users.success) this.setState('users', users.users || []);
          if (admins.success) this.setState('admins', admins.admins || []);
        }
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Get state
  getState(key) {
    return key ? this.state[key] : this.state;
  }

  // Set state
  setState(key, value) {
    this.state[key] = value;
    this.notifyListeners(key);
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
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

  // Session management
  setSession(user) {
    const session = {
      userId: user.id,
      role: user.role,
      loginTime: new Date().toISOString()
    };
    this.state.session = session;
    this.state.currentUser = user;

    localStorage.setItem('fitfun_user', JSON.stringify(user));
    localStorage.setItem('fitfun_session', JSON.stringify(session));

    this.notifyListeners('session');
    this.notifyListeners('currentUser');
  }

  clearSession() {
    this.state.session = null;
    this.state.currentUser = null;
    localStorage.removeItem('fitfun_user');
    localStorage.removeItem('fitfun_session');
    this.notifyListeners('session');
    this.notifyListeners('currentUser');
  }

  isAuthenticated() {
    return this.state.session !== null;
  }

  isAdmin() {
    return this.state.session && (this.state.session.role === 'admin' || this.state.session.role === 'super_admin');
  }

  getCurrentUser() {
    return this.state.currentUser;
  }
}

// Create singleton instance
const State = new StateManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.State = State;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = State;
}

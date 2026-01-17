/**
 * FitFun API Client
 * Standardized interface for backend communication
 */

class FitFunAPI {
    constructor() {
        this.baseUrl = '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Auth
    auth = {
        login: (email, password) =>
            this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            }),

        adminLogin: (email, password) =>
            this.request('/auth/admin-login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            }),

        register: (userData) =>
            this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            }),

        getMe: () => this.request('/auth/me'),

        logout: () => this.request('/auth/logout', { method: 'POST' })
    };

    // Competitions
    competitions = {
        getAll: () => this.request('/competitions'),

        getById: (id) => this.request(`/competitions/${id}`),

        create: (data) =>
            this.request('/competitions', {
                method: 'POST',
                body: JSON.stringify(data)
            }),

        join: (id) =>
            this.request(`/competitions/${id}/join`, {
                method: 'POST'
            }),

        update: (id, data) =>
            this.request(`/competitions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            }),

        delete: (id) =>
            this.request(`/competitions/${id}`, {
                method: 'DELETE'
            })
    };

    // Testimonials
    testimonials = {
        getAll: () => this.request('/testimonials'),

        getApproved: () => this.request('/testimonials/approved'),

        create: (data) =>
            this.request('/testimonials', {
                method: 'POST',
                body: JSON.stringify(data)
            }),

        updateStatus: (id, status) =>
            this.request(`/testimonials/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            }),

        delete: (id) =>
            this.request(`/testimonials/${id}`, {
                method: 'DELETE'
            })
    };

    // User Profile
    profile = {
        update: (data) =>
            this.request('/user/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            })
    };

    // Measurements
    measurements = {
        get: (competitionId = null) => {
            const query = competitionId ? `?competitionId=${competitionId}` : '';
            return this.request(`/measurements${query}`);
        },

        submit: (data) =>
            this.request('/measurements', {
                method: 'POST',
                body: JSON.stringify(data)
            }),

        update: (id, data) =>
            this.request(`/measurements/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            }),

        delete: (id) =>
            this.request(`/measurements/${id}`, {
                method: 'DELETE'
            })
    };
}

// Global API instance
const API = new FitFunAPI();

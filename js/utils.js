// FitFun Utility Functions

const Utils = {
    // Generate unique ID
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Date formatting
    formatDate(dateString, format = 'short') {
        const date = new Date(dateString);

        if (format === 'short') {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } else if (format === 'long') {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (format === 'relative') {
            return this.getRelativeTime(date);
        }

        return date.toLocaleDateString();
    },

    // Get relative time (e.g., "2 days ago")
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
        return `${years} year${years > 1 ? 's' : ''} ago`;
    },

    // Calculate BMI
    calculateBMI(weightKg, heightCm) {
        if (!weightKg || !heightCm) return null;
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        return Math.round(bmi * 10) / 10;
    },

    // Calculate percentage weight loss
    calculateWeightLossPercentage(startWeight, currentWeight) {
        if (!startWeight || !currentWeight) return 0;
        const loss = startWeight - currentWeight;
        const percentage = (loss / startWeight) * 100;
        return Math.round(percentage * 100) / 100;
    },

    // Calculate absolute weight loss
    calculateAbsoluteWeightLoss(startWeight, currentWeight) {
        if (!startWeight || !currentWeight) return 0;
        return Math.round((startWeight - currentWeight) * 10) / 10;
    },

    // Calculate BMI change
    calculateBMIChange(startBMI, currentBMI) {
        if (!startBMI || !currentBMI) return 0;
        return Math.round((startBMI - currentBMI) * 10) / 10;
    },

    // Calculate body fat percentage change
    calculateBodyFatChange(startBodyFat, currentBodyFat) {
        if (!startBodyFat || !currentBodyFat) return 0;
        return Math.round((startBodyFat - currentBodyFat) * 10) / 10;
    },

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    validatePassword(password) {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        return true;
    },

    // Get password strength
    getPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Validate image file
    validateImageFile(file, maxSizeMB = 5) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = maxSizeMB * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, or WebP)' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
        }

        return { valid: true };
    },

    // Convert file to base64
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // Get initials from name
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    // Truncate text
    truncate(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Debounce function
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Sort array of objects
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    // Filter array by search term
    filterBySearch(array, searchTerm, keys) {
        if (!searchTerm) return array;

        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return keys.some(key => {
                const value = item[key];
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    },

    // Calculate days between dates
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Check if date is in past
    isPast(date) {
        return new Date(date) < new Date();
    },

    // Check if date is in future
    isFuture(date) {
        return new Date(date) > new Date();
    },

    // Get competition status
    getCompetitionStatus(competition) {
        const now = new Date();
        const startDate = new Date(competition.startDate);
        const endDate = new Date(startDate.getTime() + competition.duration * 24 * 60 * 60 * 1000);
        const graceEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

        if (competition.status === 'canceled') return 'canceled';
        if (now < startDate) return 'upcoming';
        if (now >= startDate && now < endDate) return 'active';
        if (now >= endDate && now < graceEndDate) return 'grace_period';
        return 'completed';
    },

    // Calculate measurement frequency
    calculateMeasurementFrequency(duration) {
        if (duration < 30) {
            // Duration ÷ 4 checkpoints
            return Math.ceil(duration / 4);
        }
        // Weekly (7 days)
        return 7;
    },

    // Get end date from start date and duration
    getEndDate(startDate, duration) {
        const start = new Date(startDate);
        const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
        return end.toISOString();
    },

    // Check if user can edit measurement
    canEditMeasurement(competitionEndDate) {
        const now = new Date();
        const endDate = new Date(competitionEndDate);
        const graceEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
        return now < graceEndDate;
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Generate random color for avatars
    getRandomColor() {
        const colors = [
            'hsl(260, 75%, 55%)', // Primary
            'hsl(15, 75%, 55%)',  // Secondary
            'hsl(145, 55%, 50%)', // Success
            'hsl(200, 70%, 50%)', // Blue
            'hsl(280, 65%, 55%)', // Purple
            'hsl(340, 70%, 55%)', // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Calculate percentage
    calculatePercentage(value, total) {
        if (!total) return 0;
        return Math.round((value / total) * 100);
    },

    // Clamp number between min and max
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },

    // Check if object is empty
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },

    // Get query parameters from URL
    getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split('&');

        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });

        return params;
    },

    // Set query parameter in URL
    setQueryParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    },

    // Remove query parameter from URL
    removeQueryParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

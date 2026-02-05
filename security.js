/**
 * LifeBank Security Utilities
 * CSRF protection, input sanitization, and rate limiting
 */

// ============================================
// CSRF TOKEN MANAGEMENT
// ============================================

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

/**
 * Get CSRF token from session or create new one
 */
function getCSRFToken() {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
        token = generateCSRFToken();
        sessionStorage.setItem('csrf_token', token);
    }
    return token;
}

/**
 * Add CSRF token to forms
 */
function addCSRFTokenToForms() {
    const token = getCSRFToken();
    
    document.querySelectorAll('form').forEach(form => {
        // Only add if not already present
        if (!form.querySelector('input[name="csrf_token"]')) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            input.value = token;
            form.appendChild(input);
        }
    });
}

/**
 * Add CSRF token to fetch requests
 */
function getCSRFHeaders() {
    return {
        'X-CSRF-Token': getCSRFToken(),
        'Content-Type': 'application/json'
    };
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Sanitize email
 */
function sanitizeEmail(email) {
    return email.toLowerCase().trim().replace(/[^a-z0-9@\.\-_]/g, '');
}

/**
 * Sanitize phone number
 */
function sanitizePhone(phone) {
    return phone.replace(/[^0-9\-\(\)\+\s]/g, '');
}

/**
 * Validate and sanitize form data
 */
function sanitizeFormData(formData) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
            // Remove dangerous characters
            sanitized[key] = sanitizeInput(value)
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .trim();
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

// ============================================
// RATE LIMITING
// ============================================

class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = new Map();
    }
    
    /**
     * Check if action is rate limited
     */
    isLimited(identifier) {
        const now = Date.now();
        
        if (!this.attempts.has(identifier)) {
            this.attempts.set(identifier, []);
        }
        
        const timestamps = this.attempts.get(identifier);
        
        // Remove old attempts outside the window
        const validAttempts = timestamps.filter(ts => now - ts < this.windowMs);
        this.attempts.set(identifier, validAttempts);
        
        if (validAttempts.length >= this.maxAttempts) {
            return true;
        }
        
        validAttempts.push(now);
        return false;
    }
    
    /**
     * Get remaining attempts
     */
    getRemaining(identifier) {
        const timestamps = this.attempts.get(identifier) || [];
        const now = Date.now();
        const validAttempts = timestamps.filter(ts => now - ts < this.windowMs);
        return Math.max(0, this.maxAttempts - validAttempts.length);
    }
    
    /**
     * Reset attempts for identifier
     */
    reset(identifier) {
        this.attempts.delete(identifier);
    }
}

// Create rate limiters for different actions
const formSubmissionLimiter = new RateLimiter(3, 60000); // 3 attempts per minute
const loginAttemptLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes

/**
 * Prevent form spam
 */
function setupFormSpamProtection() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const userId = getUserIdentifier();
            
            if (formSubmissionLimiter.isLimited(userId)) {
                e.preventDefault();
                const remaining = formSubmissionLimiter.getRemaining(userId);
                showNotification(
                    `Too many submissions. Please try again later. (${remaining} attempts remaining)`,
                    'error'
                );
                return false;
            }
        });
    });
}

/**
 * Get user identifier (IP-like, since we don't have real IPs)
 */
function getUserIdentifier() {
    let identifier = sessionStorage.getItem('user_identifier');
    if (!identifier) {
        identifier = generateCSRFToken();
        sessionStorage.setItem('user_identifier', identifier);
    }
    return identifier;
}

// ============================================
// SECURE FETCH WRAPPER
// ============================================

/**
 * Secure fetch with CSRF protection
 */
async function secureFormSubmit(url, formData, options = {}) {
    // Rate limit check
    const userId = getUserIdentifier();
    if (formSubmissionLimiter.isLimited(userId)) {
        throw new Error('Too many requests. Please try again later.');
    }
    
    // Sanitize form data
    const sanitized = sanitizeFormData(formData);
    
    // Add CSRF token
    const body = JSON.stringify({
        ...sanitized,
        csrf_token: getCSRFToken()
    });
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getCSRFHeaders(),
            body: body,
            credentials: 'same-origin',
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Secure fetch failed:', error);
        throw error;
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    addCSRFTokenToForms();
    setupFormSpamProtection();
});

// ============================================
// EXPORTS FOR USE
// ============================================

// Make functions globally available if needed
window.Security = {
    getCSRFToken,
    sanitizeInput,
    sanitizeEmail,
    sanitizePhone,
    sanitizeFormData,
    secureFormSubmit,
    RateLimiter,
    formSubmissionLimiter,
    loginAttemptLimiter
};

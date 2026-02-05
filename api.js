/**
 * LifeBank API Configuration & Integration
 * Handles all backend API calls, WebSocket connections, and email integration
 */

// ============================================
// API CONFIGURATION
// ============================================

const API_CONFIG = {
    // API endpoints
    endpoints: {
        base: process.env.REACT_APP_API_URL || 'https://api.lifebank.org',
        donate: '/api/donate',
        donors: '/api/donors',
        inventory: '/api/inventory',
        appointments: '/api/appointments',
        users: '/api/users',
        auth: '/api/auth',
        contact: '/api/contact',
        notifications: '/api/notifications'
    },
    
    // API timeout
    timeout: 30000, // 30 seconds
    
    // Retry configuration
    retry: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1000
    }
};

// ============================================
// WEBSOCKET CONFIGURATION
// ============================================

class WebSocketManager {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = {};
    }

    /**
     * Connect to WebSocket server
     */
    connect(url = `wss://api.lifebank.org/ws`) {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);
                
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.attemptReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Send message to WebSocket server
     */
    send(type, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, data }));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    /**
     * Subscribe to WebSocket events
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Handle WebSocket messages
     */
    handleMessage(message) {
        try {
            const parsed = JSON.parse(message);
            const { type, data } = parsed;

            if (this.listeners[type]) {
                this.listeners[type].forEach(callback => callback(data));
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectDelay);
        }
    }

    /**
     * Close WebSocket connection
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Create global WebSocket manager instance
const wsManager = new WebSocketManager();

// ============================================
// API REQUEST HANDLER
// ============================================

/**
 * Make API request with retry logic
 */
async function apiRequest(endpoint, options = {}) {
    const {
        method = 'GET',
        body = null,
        headers = {},
        timeout = API_CONFIG.timeout
    } = options;

    let lastError;
    let delay = API_CONFIG.retry.initialDelay;

    for (let attempt = 1; attempt <= API_CONFIG.retry.maxAttempts; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(`${API_CONFIG.endpoints.base}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCSRFToken && getCSRFToken(),
                    ...headers
                },
                body: body ? JSON.stringify(body) : null,
                signal: controller.signal,
                credentials: 'include'
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            lastError = error;
            
            // Don't retry on 4xx errors (except timeout)
            if (error.message && error.message.includes('HTTP 4')) {
                throw error;
            }

            // Retry with exponential backoff
            if (attempt < API_CONFIG.retry.maxAttempts) {
                console.warn(`Request failed (attempt ${attempt}), retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= API_CONFIG.retry.backoffMultiplier;
            }
        }
    }

    throw new Error(`Request failed after ${API_CONFIG.retry.maxAttempts} attempts: ${lastError.message}`);
}

// ============================================
// DONOR REGISTRATION API
// ============================================

/**
 * Submit donor registration
 */
async function submitDonorRegistration(data) {
    try {
        const response = await apiRequest(API_CONFIG.endpoints.donate, {
            method: 'POST',
            body: data
        });
        
        if (response.success) {
            // Send confirmation email
            await sendConfirmationEmail(data.email, data.firstName);
        }
        
        return response;
    } catch (error) {
        console.error('Donor registration error:', error);
        throw error;
    }
}

// ============================================
// INVENTORY API
// ============================================

/**
 * Get real-time blood inventory
 */
async function getBloodInventory() {
    try {
        const response = await apiRequest(API_CONFIG.endpoints.inventory, {
            method: 'GET'
        });
        return response;
    } catch (error) {
        console.error('Failed to fetch inventory:', error);
        throw error;
    }
}

/**
 * Subscribe to inventory updates via WebSocket
 */
function subscribeToInventoryUpdates(callback) {
    wsManager.on('inventory-update', callback);
    wsManager.send('subscribe', { channel: 'inventory' });
}

// ============================================
// APPOINTMENT API
// ============================================

/**
 * Book donation appointment
 */
async function bookAppointment(data) {
    try {
        const response = await apiRequest(API_CONFIG.endpoints.appointments, {
            method: 'POST',
            body: data
        });

        if (response.success) {
            // Send appointment confirmation
            await sendAppointmentConfirmation(data.email, response.appointmentId);
        }

        return response;
    } catch (error) {
        console.error('Appointment booking error:', error);
        throw error;
    }
}

// ============================================
// EMAIL INTEGRATION
// ============================================

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(email, name) {
    try {
        await apiRequest('/api/email/send', {
            method: 'POST',
            body: {
                to: email,
                template: 'donor-confirmation',
                variables: {
                    name,
                    confirmLink: `${window.location.origin}/confirm?email=${email}`
                }
            }
        });
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
    }
}

/**
 * Send appointment confirmation
 */
async function sendAppointmentConfirmation(email, appointmentId) {
    try {
        await apiRequest('/api/email/send', {
            method: 'POST',
            body: {
                to: email,
                template: 'appointment-confirmation',
                variables: {
                    appointmentId,
                    rescheduleLink: `${window.location.origin}/reschedule?id=${appointmentId}`
                }
            }
        });
    } catch (error) {
        console.error('Failed to send appointment confirmation:', error);
    }
}

/**
 * Send contact form response email
 */
async function sendContactFormEmail(data) {
    try {
        await apiRequest('/api/email/send', {
            method: 'POST',
            body: {
                to: data.email,
                template: 'contact-acknowledgment',
                variables: {
                    name: data.firstName,
                    subject: data.subject
                }
            }
        });
    } catch (error) {
        console.error('Failed to send contact form email:', error);
    }
}

// ============================================
// AUTHENTICATION API
// ============================================

/**
 * Login user
 */
async function loginUser(email, password) {
    try {
        const response = await apiRequest(API_CONFIG.endpoints.auth + '/login', {
            method: 'POST',
            body: { email, password }
        });

        if (response.token) {
            localStorage.setItem('auth_token', response.token);
        }

        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Logout user
 */
async function logoutUser() {
    try {
        await apiRequest(API_CONFIG.endpoints.auth + '/logout', {
            method: 'POST'
        });
        localStorage.removeItem('auth_token');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize WebSocket connection when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only connect if not in development
    if (process.env.NODE_ENV !== 'development') {
        wsManager.connect().catch(error => {
            console.warn('Failed to connect to WebSocket:', error);
        });
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    wsManager.disconnect();
});

// ============================================
// EXPORTS
// ============================================

window.API = {
    config: API_CONFIG,
    wsManager,
    apiRequest,
    submitDonorRegistration,
    getBloodInventory,
    subscribeToInventoryUpdates,
    bookAppointment,
    sendConfirmationEmail,
    sendAppointmentConfirmation,
    sendContactFormEmail,
    loginUser,
    logoutUser
};

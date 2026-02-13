/**
 * Authentication Service for Cross-App Lecture Access
 * Handles secure token validation when students access from external apps (e.g., Next.js)
 */

import { appSettings } from '../config/appSettings';

const BASE_URL = `${appSettings.apiUrl}/Learning`;

/**
 * Validate access token from external application
 * POST /api/Learning/auth/validate-access
 * 
 * @param {string} token - Encrypted JWT token from external app
 * @returns {Promise<{valid: boolean, studentId: number, courseId: number, lectureId: number}>}
 */
export const validateAccessToken = async (token) => {
    const response = await fetch(`${BASE_URL}/auth/validate-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Access denied' }));
        throw new Error(error.message || 'Invalid or expired access token');
    }
    
    return response.json();
};

/**
 * Get session token for authenticated API calls
 * POST /api/Learning/auth/session
 * 
 * @param {string} accessToken - Validated access token
 * @returns {Promise<{sessionToken: string, expiresAt: string}>}
 */
export const getSessionToken = async (accessToken) => {
    const response = await fetch(`${BASE_URL}/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
    });
    
    if (!response.ok) {
        throw new Error('Failed to create session');
    }
    
    return response.json();
};

/**
 * Parse URL parameters to extract token and lecture info
 * @returns {{token: string|null, courseId: string|null, lectureId: string|null}}
 */
export const parseAccessParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        token: params.get('token') || params.get('t'),
        courseId: params.get('courseId'),
        lectureId: params.get('lectureId'),
        isPdf: (params.get('Ispdf') || params.get('ispdf')) === '1' || String(params.get('Ispdf') || params.get('ispdf')).toLowerCase() === 'true'
    };
};

/**
 * Store session in secure storage
 * @param {object} session - Session data
 */
export const storeSession = (session) => {
    // Use sessionStorage for security (cleared when browser closes)
    sessionStorage.setItem('classroom_session', JSON.stringify({
        ...session,
        storedAt: Date.now()
    }));
};

/**
 * Get stored session
 * @returns {object|null}
 */
export const getStoredSession = () => {
    const stored = sessionStorage.getItem('classroom_session');
    if (!stored) return null;
    
    try {
        const session = JSON.parse(stored);
        // Check if session is expired (default 1 hour)
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
            clearSession();
            return null;
        }
        return session;
    } catch {
        return null;
    }
};

/**
 * Clear session
 */
export const clearSession = () => {
    sessionStorage.removeItem('classroom_session');
};

/**
 * Create authorization header for API calls
 * @returns {object} Headers with authorization
 */
export const getAuthHeaders = () => {
    const session = getStoredSession();
    if (!session?.sessionToken) {
        return { 'Content-Type': 'application/json' };
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.sessionToken}`
    };
};

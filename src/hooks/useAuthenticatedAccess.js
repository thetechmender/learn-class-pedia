import { useState, useEffect, useCallback } from 'react';
import {
    validateAccessToken,
    parseAccessParams,
    storeSession,
    getStoredSession,
    clearSession
} from '../services/authService';

/**
 * Hook to handle authenticated access from external applications
 * Validates tokens and manages session state
 * 
 * @returns {{
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   error: string|null,
 *   studentId: number|null,
 *   courseId: number|null,
 *   lectureId: number|null,
 *   logout: () => void
 * }}
 */
const useAuthenticatedAccess = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accessData, setAccessData] = useState({
        studentId: null,
        courseId: null,
        lectureId: null
    });

    const validateAccess = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // First check for existing valid session
            const existingSession = getStoredSession();
            if (existingSession?.studentId && existingSession?.courseId) {
                setAccessData({
                    studentId: existingSession.studentId,
                    courseId: existingSession.courseId,
                    lectureId: existingSession.lectureId
                });
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            // Parse URL parameters for new access
            const { token, courseId, lectureId } = parseAccessParams();

            if (!token) {
                // No token - could be direct access or development mode
                // In production, you might want to redirect to login
                setError('No access token provided. Please access through the main portal.');
                setIsLoading(false);
                return;
            }

            // Validate token with backend
            const validationResult = await validateAccessToken(token);

            if (!validationResult.valid) {
                setError('Invalid or expired access token. Please try again from the main portal.');
                setIsLoading(false);
                return;
            }

            // Store session for subsequent API calls
            storeSession({
                studentId: validationResult.studentId,
                courseId: validationResult.courseId || courseId,
                lectureId: validationResult.lectureId || lectureId,
                sessionToken: validationResult.sessionToken,
                expiresAt: validationResult.expiresAt
            });

            setAccessData({
                studentId: validationResult.studentId,
                courseId: validationResult.courseId || parseInt(courseId),
                lectureId: validationResult.lectureId || lectureId
            });
            setIsAuthenticated(true);

            // Clean URL (remove token from address bar for security)
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

        } catch (err) {
            console.error('Authentication error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
            clearSession();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        clearSession();
        setIsAuthenticated(false);
        setAccessData({ studentId: null, courseId: null, lectureId: null });
        // Optionally redirect to main portal
        // window.location.href = 'https://your-nextjs-app.com/login';
    }, []);

    useEffect(() => {
        validateAccess();
    }, [validateAccess]);

    return {
        isAuthenticated,
        isLoading,
        error,
        studentId: accessData.studentId,
        courseId: accessData.courseId,
        lectureId: accessData.lectureId,
        logout,
        revalidate: validateAccess
    };
};

export default useAuthenticatedAccess;

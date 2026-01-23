import React from 'react';
import { AlertCircle, Lock, RefreshCw, GraduationCap } from 'lucide-react';
import useAuthenticatedAccess from '../hooks/useAuthenticatedAccess';
import LinkedInStyleDemo from './LinkedInStyleDemo';

/**
 * AuthenticatedLecture - Wrapper component for secure cross-app lecture access
 * 
 * This component handles authentication when students access from external apps (e.g., Next.js).
 * 
 * URL Format from Next.js app:
 * https://your-classroom-app.com/lecture?token=<JWT_TOKEN>&courseId=123&lectureId=456
 * 
 * The token should be a JWT signed by your backend containing:
 * - studentId: The authenticated student's ID
 * - courseId: The course being accessed
 * - lectureId: (optional) Specific lecture to start with
 * - exp: Expiration timestamp (short-lived, e.g., 5 minutes)
 * - iat: Issued at timestamp
 */
const AuthenticatedLecture = () => {
    const {
        isAuthenticated,
        isLoading,
        error,
        studentId,
        courseId,
        lectureId,
        revalidate
    } = useAuthenticatedAccess();

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin mx-auto mb-4"></div>
                        <Lock className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-800 dark:text-white text-lg font-medium mt-4">Verifying access...</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Please wait while we authenticate your session</p>
                </div>
            </div>
        );
    }

    // Error/Unauthorized state
    if (error || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-gray-800 dark:text-white text-xl font-bold mb-2">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {error || 'You do not have permission to access this lecture. Please access through the main learning portal.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={revalidate}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2 justify-center shadow-lg hover:shadow-xl"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <a
                            href={process.env.REACT_APP_MAIN_PORTAL_URL || '/'}
                            className="px-6 py-3 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 justify-center"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Go to Portal
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Authenticated - render the classroom with the authenticated context
    return (
        <LinkedInStyleDemo 
            authenticatedStudentId={studentId}
            authenticatedCourseId={courseId}
            initialLectureId={lectureId}
        />
    );
};

export default AuthenticatedLecture;

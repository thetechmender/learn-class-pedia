import { getAuthHeaders } from './authService';
import { appSettings } from '../config/appSettings';

const BASE_URL = `${appSettings.apiUrl}/Learning`;

/**
 * Get course details
 * GET /api/Learning/course/{courseId}
 */
export const getCourseDetails = async (courseId) => {
    const response = await fetch(`${BASE_URL}/course/${courseId}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch course details');
    return response.json();
};

/**
 * Get lecture sections for a course
 * GET /api/Learning/course/{courseId}/lecture-sections
 */
export const getLectureSections = async (courseId) => {
    const response = await fetch(`${BASE_URL}/course/${courseId}/lecture-sections`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch lecture sections');
    return response.json();
};

/**
 * Get student course progress
 * GET /api/Learning/course/{courseId}/progress
 */
export const getStudentProgress = async (studentId, courseId) => {
    const response = await fetch(`${BASE_URL}/course/${courseId}/progress`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch student progress');
    return response.json();
};

/**
 * Mark lecture as complete
 * POST /api/Learning/lecture/{lectureId}/complete
 */
export const markLectureComplete = async (studentId, lectureId) => {
    const response = await fetch(`${BASE_URL}/lecture/${lectureId}/complete`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to mark lecture complete');
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
};

/**
 * Toggle lecture bookmark
 * POST /api/Learning/lecture/{lectureId}/bookmark
 */
export const toggleLectureBookmark = async (studentId, lectureId) => {
    const response = await fetch(`${BASE_URL}/lecture/${lectureId}/bookmark`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to toggle bookmark');
    return response.json();
};

/**
 * Save lecture notes
 * PUT /api/Learning/lecture/{lectureId}/notes
 */
export const saveLectureNotes = async (studentId, lectureId, notes) => {
    const response = await fetch(`${BASE_URL}/lecture/${lectureId}/notes`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes })
    });
    if (!response.ok) throw new Error('Failed to save notes');
    return response.json();
};

/**
 * Update lecture watch progress
 * POST /api/Learning/lecture/{lectureId}/watch
 */
export const updateLectureWatch = async (studentId, lectureId, payload) => {
    const response = await fetch(`${BASE_URL}/lecture/${lectureId}/watch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to update lecture watch progress');
    return response.json();
};

/**
 * Get lecture details
 * GET /api/Learning/lecture/{lectureId}
 */
export const getLectureDetails = async (lectureId) => {
    const response = await fetch(`${BASE_URL}/lecture/${lectureId}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch lecture details');
    return response.json();
};

export const getLecturePdfPathForClasspedia = async (lecturePdfId) => {
    const response = await fetch(`${BASE_URL}/lecture-pdf/${lecturePdfId}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch lecture PDF path');
    return response.json();
};

const BASE_URL = 'https://localhost:7043/api/Learning';

/**
 * Get course details
 * GET /api/Learning/course/{courseId}
 */
export const getCourseDetails = async (courseId) => {
    const response = await fetch(`${BASE_URL}/course/${courseId}`);
    if (!response.ok) throw new Error('Failed to fetch course details');
    return response.json();
};

/**
 * Get lecture sections for a course
 * GET /api/Learning/course/{courseId}/lecture-sections
 */
export const getLectureSections = async (courseId) => {
    const response = await fetch(`${BASE_URL}/course/${courseId}/lecture-sections`);
    if (!response.ok) throw new Error('Failed to fetch lecture sections');
    return response.json();
};

/**
 * Get student course progress
 * GET /api/Learning/student/{studentId}/course/{courseId}/progress
 */
export const getStudentProgress = async (studentId, courseId) => {
    const response = await fetch(`${BASE_URL}/student/${studentId}/course/${courseId}/progress`);
    if (!response.ok) throw new Error('Failed to fetch student progress');
    return response.json();
};

/**
 * Mark lecture as complete
 * POST /api/Learning/student/{studentId}/lecture/{lectureId}/complete
 */
export const markLectureComplete = async (studentId, lectureId) => {
    const response = await fetch(`${BASE_URL}/student/${studentId}/lecture/${lectureId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to mark lecture complete');
    return response.json();
};

/**
 * Toggle lecture bookmark
 * POST /api/Learning/student/{studentId}/lecture/{lectureId}/bookmark
 */
export const toggleLectureBookmark = async (studentId, lectureId) => {
    const response = await fetch(`${BASE_URL}/student/${studentId}/lecture/${lectureId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to toggle bookmark');
    return response.json();
};

/**
 * Save lecture notes
 * PUT /api/Learning/student/{studentId}/lecture/{lectureId}/notes
 */
export const saveLectureNotes = async (studentId, lectureId, notes) => {
    const response = await fetch(`${BASE_URL}/student/${studentId}/lecture/${lectureId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
    });
    if (!response.ok) throw new Error('Failed to save notes');
    return response.json();
};

/**
 * Update lecture watch progress
 * POST /api/Learning/student/{studentId}/lecture/{lectureId}/watch
 */
export const updateLectureWatch = async (studentId, lectureId, payload) => {
    const response = await fetch(`${BASE_URL}/student/${studentId}/lecture/${lectureId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${BASE_URL}/lecture/${lectureId}`);
    if (!response.ok) throw new Error('Failed to fetch lecture details');
    return response.json();
};

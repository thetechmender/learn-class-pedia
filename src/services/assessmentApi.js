import { getAuthHeaders } from './authService';

const BASE_URL = `${process.env.REACT_APP_API_URL}/Assesment`;

/**
 * Get assessment questions for a lecture
 * GET /api/Assesment/{lectureId}/assessment
 */
export const getAssessment = async (lectureId) => {
    const response = await fetch(`${BASE_URL}/${lectureId}/assessment`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch assessment');
    return response.json();
};

/**
 * Save assessment progress (local storage fallback)
 */
export const saveAssessmentProgress = async (studentId, lectureId, progress) => {
    try {
        localStorage.setItem(
            `assessment_progress_${lectureId}_${studentId}`,
            JSON.stringify(progress)
        );
        return { success: true };
    } catch (error) {
        console.log('Failed to save progress:', error);
        return { success: false };
    }
};

/**
 * Submit assessment answers
 * POST /api/Assesment/submit
 */
export const submitAssessment = async (studentId, lectureId, answers) => {
    const payload = {
        studentId,
        lectureId: parseInt(lectureId),
        answers: answers.map(a => ({
            quizQuestionId: a.quizQuestionId,
            selectedOptionLetter: a.selectedAnswer
        }))
    };
    
    const response = await fetch(`${BASE_URL}/submit`, {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to submit assessment');
    return response.json();
};

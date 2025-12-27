import api from '../api/axiosConfig';

export const assessmentService = {
    // --- ASSESSMENTS ---

    // Get all assessments
    getAllAssessments: async () => {
        const response = await api.get('/courses/api/v1/assessments');
        return response.data;
    },

    // Get assessment by ID
    getAssessmentById: async (id) => {
        const response = await api.get(`/courses/api/v1/assessments/${id}`);
        const data = response.data;
        // Parse questions if they come as a string from the DB
        if (data && typeof data.questions === 'string') {
            try { data.questions = JSON.parse(data.questions); } catch (e) { data.questions = []; }
        }
        return data;
    },

    // Get assessments by course
    getAssessmentsByCourse: async (courseId) => {
        const response = await api.get(`/courses/api/v1/assessments/course/${courseId}`);
        return response.data;
    },

    // Get assessments by course and week
    getAssessmentsByCourseAndWeek: async (courseId, weekNumber) => {
        const response = await api.get(`/courses/api/v1/assessments/course/${courseId}/week/${weekNumber}`);
        return response.data;
    },

    // Create assessment
    createAssessment: async (assessmentData) => {
        const response = await api.post('/courses/api/v1/assessments', assessmentData);
        return response.data;
    },

    // Update assessment
    updateAssessment: async (id, assessmentData) => {
        const response = await api.put(`/courses/api/v1/assessments/${id}`, assessmentData);
        return response.data;
    },

    // Delete assessment
    deleteAssessment: async (id) => {
        await api.delete(`/courses/api/v1/assessments/${id}`);
    },

    // --- STUDENT ASSESSMENTS (Submissions) ---

    // Get all student assessments
    getAllStudentAssessments: async () => {
        const response = await api.get('/courses/api/v1/student-assessments');
        return response.data;
    },

    // Get student assessment by ID
    getStudentAssessmentById: async (id) => {
        const response = await api.get(`/courses/api/v1/student-assessments/${id}`);
        return response.data;
    },

    // Get student assessments by student ID
    getStudentAssessmentsByStudent: async (studentId) => {
        const response = await api.get(`/courses/api/v1/student-assessments/student/${studentId}`);
        return response.data;
    },

    // Get student assessments by assessment ID
    getSubmissionsByAssessment: async (assessmentId) => {
        const response = await api.get(`/courses/api/v1/student-assessments/assessment/${assessmentId}`);
        return response.data;
    },

    // Submit assessment (student)
    submitAssessment: async (submissionData) => {
        const response = await api.post('/courses/api/v1/student-assessments', submissionData);
        return response.data;
    },

    // Update student assessment (grading)
    gradeAssessment: async (id, gradingData) => {
        const response = await api.put(`/courses/api/v1/student-assessments/${id}`, gradingData);
        return response.data;
    },

    // Delete student assessment
    deleteStudentAssessment: async (id) => {
        await api.delete(`/courses/api/v1/student-assessments/${id}`);
    }
};

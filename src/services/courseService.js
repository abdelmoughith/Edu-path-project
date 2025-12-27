import api from '../api/axiosConfig';

/**
 * Course Service - Aligned with OpenAPI v0 Spec
 * Handles Course, Materials, Assessments and Enrollments
 */
export const courseService = {
    // --- COURSES (Course Controller) ---

    /**
     * Fetch all available courses (The Catalogue)
     * GET /api/v1/courses
     */
    getAllCourses: async () => {
        const response = await api.get('/courses/api/v1/courses');
        return response.data || [];
    },

    /**
     * Fetch single course metadata including materials & assessments
     * GET /api/v1/courses/{courseId}
     */
    getCourseById: async (id) => {
        const response = await api.get(`/courses/api/v1/courses/${id}`);
        return response.data;
    },

    /**
     * Search courses by title query
     * GET /api/v1/courses/search?title=...
     */
    searchCourses: async (title) => {
        const response = await api.get(`/courses/api/v1/courses/search?title=${encodeURIComponent(title)}`);
        return response.data || [];
    },

    /**
     * Student Enrollment (Follow)
     * POST /api/v1/courses/{id}/follow
     */
    followCourse: async (id) => {
        const response = await api.post(`/courses/api/v1/courses/${id}/follow`);

        // SYNC LAYER: Persist enrollment locally for instant recovery
        try {
            const { userService } = await import('./userService');
            const user = await userService.getMe().catch(() => null);
            if (user?.id) {
                const key = `user_${user.id}_active_enrollments`;
                const enrolled = JSON.parse(localStorage.getItem(key) || "[]");
                if (!enrolled.includes(id)) {
                    enrolled.push(id);
                    localStorage.setItem(key, JSON.stringify(enrolled));
                }
            }
        } catch (e) {
            console.warn("[CourseService] Local sync failed", e);
        }

        return response.data;
    },

    /**
     * Retrieve Enrolled Courses (Smart Recovery Strategy)
     * Since there is no direct /my-courses in Swagger, 
     * we combine local persistence, activity trails, and progress signals.
     */
    getMyCourses: async () => {
        try {
            // Reconstruct enrollments using Local Sync + Activities + Progress
            // This is the source of truth for the student experience in our microservices arch
            const { userService } = await import('./userService');
            const { activityService } = await import('./activityService');

            const user = await userService.getMe().catch(() => null);
            if (!user?.id) return [];

            const allCourses = await courseService.getAllCourses();
            const key = `user_${user.id}_active_enrollments`;
            let enrolledIds = JSON.parse(localStorage.getItem(key) || "[]");

            // Search for "Ghost Enrollments" in activity logs
            const activeSigns = new Set();
            try {
                const activities = await activityService.getActivitiesByStudentId(user.id).catch(() => []);
                activities.forEach(a => { if (a.courseCode) activeSigns.add(a.courseCode); });
            } catch (err) { }

            const recovered = [];
            allCourses.forEach(course => {
                if (enrolledIds.includes(course.id)) return;

                const hasActivity = activeSigns.has(course.id) || activeSigns.has(course.courseCode);
                const hasProgress = localStorage.getItem(`user_${user.id}_course_${course.id}_percentage`) !== null;

                if (hasActivity || hasProgress) recovered.push(course.id);
            });

            if (recovered.length > 0) {
                enrolledIds = [...new Set([...enrolledIds, ...recovered])];
                localStorage.setItem(key, JSON.stringify(enrolledIds));
            }

            return allCourses.filter(c => enrolledIds.includes(c.id));
        } catch (err) {
            console.error("[CourseService] getMyCourses failed:", err);
            return [];
        }
    },

    // --- VLE MATERIALS (VLE Material Controller) ---

    /**
     * Fetch all learning materials for a specific course
     * GET /api/v1/vle-materials/course/{courseId}
     */
    getMaterialsByCourse: async (courseId) => {
        const response = await api.get(`/courses/api/v1/vle-materials/course/${courseId}`);
        return response.data || [];
    },

    /**
     * Create new learning material
     * POST /api/v1/vle-materials
     */
    createMaterial: async (materialData) => {
        const response = await api.post('/courses/api/v1/vle-materials', materialData);
        return response.data;
    },

    /**
     * Delete learning material
     * DELETE /api/v1/vle-materials/{id}
     */
    deleteMaterial: async (id) => {
        const response = await api.delete(`/courses/api/v1/vle-materials/${id}`);
        return response.data;
    },

    // --- ASSESSMENTS (Assessment Controller) ---

    /**
     * Fetch all assessments (Quizzes, Assignments) for a course
     * GET /api/v1/assessments/course/{courseId}
     */
    getAssessmentsByCourse: async (courseId) => {
        const response = await api.get(`/courses/api/v1/assessments/course/${courseId}`);
        return response.data || [];
    },

    // --- ADMIN CRUD OPERATIONS ---

    /**
     * Create a new course
     * POST /api/v1/courses
     * @param {CourseCreateUpdateDTO} courseData - Course data to create
     */
    createCourse: async (courseData) => {
        const response = await api.post('/courses/api/v1/courses', courseData);
        return response.data;
    },

    /**
     * Update an existing course
     * PUT /api/v1/courses/{courseId}
     * @param {string} courseId - The course ID
     * @param {CourseCreateUpdateDTO} courseData - Updated course data
     */
    updateCourse: async (courseId, courseData) => {
        const response = await api.put(`/courses/api/v1/courses/${courseId}`, courseData);
        return response.data;
    },

    /**
     * Delete a course
     * DELETE /api/v1/courses/{courseId}
     * @param {string} courseId - The course ID to delete
     */
    deleteCourse: async (courseId) => {
        const response = await api.delete(`/courses/api/v1/courses/${courseId}`);
        return response.data;
    }
};

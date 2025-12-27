import api from '../api/axiosConfig';

export const activityService = {
    // Get all activities
    getAllActivities: async () => {
        const response = await api.get('/activities/api/activities');
        return response.data;
    },

    // Get activity by ID
    getActivityById: async (id) => {
        const response = await api.get(`/activities/api/activities/${id}`);
        return response.data;
    },

    // Create activity
    createActivity: async (activityData) => {
        const response = await api.post('/activities/api/activities', activityData);
        return response.data;
    },

    // Update activity
    updateActivity: async (id, activityData) => {
        const response = await api.put(`/activities/api/activities/${id}`, activityData);
        return response.data;
    },

    // Delete activity
    deleteActivity: async (id) => {
        await api.delete(`/activities/api/activities/${id}`);
    },

    // Increment clicks
    incrementClicks: async (studentId, courseCode, moduleCode, date, clicks = 1) => {
        const response = await api.post('/activities/api/activities/increment', null, {
            params: { studentId, courseCode, moduleCode, date, clicks }
        });
        return response.data;
    },

    // Get activities by student ID
    getActivitiesByStudentId: async (studentId) => {
        const response = await api.get(`/activities/api/activities/student/${studentId}`);
        return response.data;
    },

    // Get total clicks by student
    getTotalClicksByStudent: async (studentId) => {
        const response = await api.get(`/activities/api/activities/student/${studentId}/total-clicks`);
        return response.data;
    },

    // Get activities by student and date range
    getActivitiesByStudentAndDateRange: async (studentId, startDate, endDate) => {
        const response = await api.get(`/activities/api/activities/student/${studentId}/date-range`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    // Get activities by student and course
    getActivitiesByStudentAndCourse: async (studentId, courseCode, moduleCode) => {
        const response = await api.get(`/activities/api/activities/student/${studentId}/course/${courseCode}/${moduleCode}`);
        return response.data;
    },

    // Get total clicks by student and course
    getTotalClicksByStudentAndCourse: async (studentId, courseCode, moduleCode) => {
        const response = await api.get(`/activities/api/activities/student/${studentId}/course/${courseCode}/${moduleCode}/total-clicks`);
        return response.data;
    },

    // Get activities by course
    getActivitiesByCourse: async (courseCode, moduleCode) => {
        const response = await api.get(`/activities/api/activities/course/${courseCode}/${moduleCode}`);
        return response.data;
    },

    // Get activities by course and date range
    getActivitiesByCourseAndDateRange: async (courseCode, moduleCode, startDate, endDate) => {
        const response = await api.get(`/activities/api/activities/course/${courseCode}/${moduleCode}/date-range`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    // Aggregated stats for Admin Dashboard (Helper)
    getActivityStats: async () => {
        try {
            const activities = await activityService.getAllActivities();

            const totalClicks = activities.reduce((sum, a) => sum + (a.sumClicks || 0), 0);
            const activeStudents = new Set(activities.map(a => a.studentId)).size;

            const courseStats = {};
            activities.forEach(a => {
                courseStats[a.courseCode] = (courseStats[a.courseCode] || 0) + (a.sumClicks || 0);
            });

            let mostPopularCourse = { code: 'N/A', clicks: 0 };
            Object.entries(courseStats).forEach(([code, clicks]) => {
                if (clicks > mostPopularCourse.clicks) {
                    mostPopularCourse = { code, clicks };
                }
            });

            return {
                totalClicks,
                activeStudents,
                mostPopularCourse,
                recentActivities: activities.slice(-5).reverse()
            };
        } catch (error) {
            console.error("Error calculating activity stats:", error);
            return {
                totalClicks: 0,
                activeStudents: 0,
                mostPopularCourse: { code: 'N/A', clicks: 0 },
                recentActivities: []
            };
        }
    }
};

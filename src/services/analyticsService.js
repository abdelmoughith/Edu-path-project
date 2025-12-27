import axios from 'axios';

/**
 * Dedicated Axios instance for the independent AI Service.
 * Connects directly to http://127.0.0.1:8000 as requested.
 * Bypasses the main gateway.
 */
const aiApi = axios.create({
    baseURL: 'http://127.0.0.1:8001',
    headers: { 'Content-Type': 'application/json' }
});

/**
 * Analytics Service for AI predictions and recommendations.
 */
export const analyticsService = {
    // POST /predict
    // Predict success probability and risk level
    predictSuccess: async (studentId, moduleCode, customMetrics = null) => {
        try {
            const payload = {
                student_id: studentId,
                module_code: moduleCode
            };

            if (customMetrics) {
                payload.custom_metrics = customMetrics;
            }

            const response = await aiApi.post('/predict', payload);

            if (response.data && typeof response.data.success_proba === 'number') {
                return response.data;
            }

            throw new Error('Format de réponse invalide');
        } catch (error) {
            console.error('AI prediction failed:', error);
            const message = error.response?.data?.detail || error.message;
            throw new Error(`Erreur prédiction IA: ${message}`);
        }
    },

    // GET /reco/{studentId}/{moduleCode}
    // Get personalized content recommendations
    getRecommendations: async (studentId, moduleCode) => {
        try {
            const response = await aiApi.get(`/reco/${studentId}/${moduleCode}`);

            if (response.data && Array.isArray(response.data.recommendations)) {
                return response.data;
            }

            throw new Error('Format de réponse invalide');
        } catch (error) {
            console.error('AI recommendations failed:', error);
            const message = error.response?.data?.detail || error.message;
            throw new Error(`Erreur recommandations IA: ${message}`);
        }
    },

    // GET /health
    // Check AI microservice health
    checkHealth: async () => {
        try {
            const response = await aiApi.get('/health');
            return response.data;
        } catch (error) {
            console.warn('AI service health check failed:', error.message);
            return { status: 'unavailable' };
        }
    }
};


import axios from 'axios';

const api = axios.create({
    // baseURL relative pour utiliser le proxy Vite (Gateway)
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Intercepteur pour gérer l'expiration du token (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
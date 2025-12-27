import api from '../api/axiosConfig';

export const userService = {
    // Inscription (POST /users/auth/register)
    // Spec: /auth/register under /users -> /users/auth/register
    // Spec Body: { email, password } ONLY. Extra fields might be ignored or cause error.
    register: async (firstName, lastName, email, password, role) => {
        console.log("Registering to: /users/auth/register (Spec Compliant)");
        // On envoie tout, si le backend ignore firstName/lastName c'est pas grave, 
        // mais s'il plante (500) car il manque des champs en BDD, c'est un pb backend.
        const response = await api.post('/users/auth/register', { firstName, lastName, email, password, role });
        return response.data;
    },

    // Connexion (POST /users/auth/login)
    login: async (email, password) => {
        const response = await api.post('/users/auth/login', { email, password });
        // Ton backend renvoie { "token": "..." }
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    // Profil (GET /users/api/user/me)
    getMe: async () => {
        const response = await api.get('/users/api/user/me');
        return response.data;
    },

    // Récupérer tous les étudiants (Admin)
    getAllStudents: async () => {
        try {
            // D'après la spec OpenAPI: GET /users/auth
            const response = await api.get('/users/auth');
            console.log("Users fetched:", response.data);
            return response.data;

        } catch (error) {
            console.error("Erreur Backend lors de la récupération des utilisateurs:", error);

            // Si c'est une 500, c'est probablement à cause des données NULL en base
            if (error.response?.status === 500) {
                console.warn("INDICE: Vérifiez que vos utilisateurs en BDD n'ont pas de champs 'firstName' ou 'lastName' à NULL.");
            }

            return [];
        }
    },

    // Récupérer un utilisateur par ID
    getUserById: async (userId) => {
        try {
            const response = await api.get(`/users/api/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
        }
    },

    // Mettre à jour le profil (PUT /users/api/user/{id})
    updateProfile: async (userId, userData) => {
        const response = await api.put(`/users/api/user/${userId}`, userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};
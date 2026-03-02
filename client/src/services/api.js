import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/register')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Fields
export const fieldsAPI = {
    getAll: () => api.get('/fields'),
    getById: (id) => api.get(`/fields/${id}`),
    create: (data) => api.post('/fields', data),
    update: (id, data) => api.put(`/fields/${id}`, data),
    delete: (id) => api.delete(`/fields/${id}`),
};

// Crops
export const cropsAPI = {
    getAll: (params) => api.get('/crops', { params }),
    getById: (id) => api.get(`/crops/${id}`),
    create: (data) => api.post('/crops', data),
    update: (id, data) => api.put(`/crops/${id}`, data),
    delete: (id) => api.delete(`/crops/${id}`),
};

// Operations
export const operationsAPI = {
    getAll: (params) => api.get('/operations', { params }),
    getById: (id) => api.get(`/operations/${id}`),
    create: (data) => api.post('/operations', data),
    update: (id, data) => api.put(`/operations/${id}`, data),
    delete: (id) => api.delete(`/operations/${id}`),
};

// Sheep
export const sheepAPI = {
    getAll: (params) => api.get('/sheep', { params }),
    getById: (id) => api.get(`/sheep/${id}`),
    create: (data) => api.post('/sheep', data),
    update: (id, data) => api.put(`/sheep/${id}`, data),
    delete: (id) => api.delete(`/sheep/${id}`),
    getWeightHistory: (id) => api.get(`/sheep/${id}/weight-history`),
};

// Vaccinations
export const vaccinationsAPI = {
    getAll: (params) => api.get('/vaccinations', { params }),
    getUpcoming: () => api.get('/vaccinations/upcoming'),
    create: (data) => api.post('/vaccinations', data),
    update: (id, data) => api.put(`/vaccinations/${id}`, data),
    delete: (id) => api.delete(`/vaccinations/${id}`),
};

// Treatments
export const treatmentsAPI = {
    getAll: (params) => api.get('/treatments', { params }),
    create: (data) => api.post('/treatments', data),
    update: (id, data) => api.put(`/treatments/${id}`, data),
    delete: (id) => api.delete(`/treatments/${id}`),
};

// Births
export const birthsAPI = {
    getAll: (params) => api.get('/births', { params }),
    create: (data) => api.post('/births', data),
    update: (id, data) => api.put(`/births/${id}`, data),
    delete: (id) => api.delete(`/births/${id}`),
};

// Water
export const waterAPI = {
    getAll: (params) => api.get('/water', { params }),
    getReadings: (params) => api.get('/water', { params }),
    create: (data) => api.post('/water', data),
    createReading: (data) => api.post('/water', data),
    update: (id, data) => api.put(`/water/${id}`, data),
    updateReading: (id, data) => api.put(`/water/${id}`, data),
    delete: (id) => api.delete(`/water/${id}`),
    deleteReading: (id) => api.delete(`/water/${id}`),
    getSummary: () => api.get('/water/summary'),
    getSavings: () => api.get('/water/savings'),
    getSmartSuggestion: (fieldId) => api.get(`/water/smart-suggest/${fieldId}`),
};

// Weather
export const weatherAPI = {
    getAll: (params) => api.get('/weather', { params }),
    create: (data) => api.post('/weather', data),
    getRealtime: (params) => api.get('/weather/realtime', { params }),
};

// Predictions
export const predictionsAPI = {
    getAll: (params) => api.get('/predictions', { params }),
    generate: (data) => api.post('/predictions/generate', data),
    getComparison: (params) => api.get('/predictions/comparison', { params }),
    compare: (params) => api.get('/predictions/comparison', { params }),
};

// Recommendations
export const recommendationsAPI = {
    getAll: (params) => api.get('/recommendations', { params }),
    update: (id, data) => api.put(`/recommendations/${id}`, data),
};

// Anomalies
export const anomaliesAPI = {
    getAll: (params) => api.get('/anomalies', { params }),
    resolve: (id, data) => api.put(`/anomalies/${id}/resolve`, data),
};

// Dashboard
export const dashboardAPI = {
    getStats: () => api.get('/dashboard'),
};

export default api;

// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const apiService = {
    // Project creation
    createProject: (projectData) => api.post('/projects/create', projectData),

    // AI website generation
    generateWebsite: (prompt, options) => api.post('/ai/generate-website', { prompt, options }),

    // Figma integration
    processFigmaLink: (figmaUrl) => api.post('/figma/process', { figmaUrl }),

    // Code generation
    buildWebsite: (projectId, config) => api.post('/build/generate', { projectId, config }),

    // Project management
    getProjects: () => api.get('/projects'),
    updateProject: (projectId, data) => api.put(`/projects/${projectId}`, data),
    deleteProject: (projectId) => api.delete(`/projects/${projectId}`),

    // API key configuration
    configureKeys: (projectId, keys) => api.post(`/projects/${projectId}/configure-keys`, keys),

    // Download generated code
    downloadProject: (projectId) => api.get(`/projects/${projectId}/download`, { responseType: 'blob' }),
};

export default api;

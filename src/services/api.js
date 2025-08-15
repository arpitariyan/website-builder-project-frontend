// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    // Authentication
    post: (url, data) => api.post(url, data),
    get: (url, config) => api.get(url, config),
    put: (url, data) => api.put(url, data),
    patch: (url, data) => api.patch(url, data),
    delete: (url) => api.delete(url),

    // Projects
    getProjects: () => api.get('/projects'),
    getProject: (id) => api.get(`/projects/${id}`),
    createProject: (data) => api.post('/projects/create', data),
    updateProject: (id, data) => api.put(`/projects/${id}`, data),
    deleteProject: (id) => api.delete(`/projects/${id}`),
    duplicateProject: (id) => api.post(`/projects/${id}/duplicate`),
    publishProject: (id, data) => api.post(`/projects/${id}/publish`, data),
    downloadProject: (id) => api.get(`/projects/${id}/download`, { responseType: 'blob' }),
    autoSaveProject: (id, content) => api.patch(`/projects/${id}/autosave`, { content }),

    // Templates
    getTemplates: (params) => api.get('/templates', { params }),
    getTemplate: (id) => api.get(`/templates/${id}`),
    getTemplateCategories: () => api.get('/templates/categories'),
    getFeaturedTemplates: () => api.get('/templates/featured/list'),

    // AI Generation
    generateWebsite: (prompt, options) => api.post('/ai/generate-website', { prompt, options }),
    suggestComponents: (content, context) => api.post('/ai/suggest-components', { content, context }),
    generateCodeFromProject: (projectId) => api.post(`/projects/${projectId}/generate-code`),
    generateFromFigma: (projectId, data) => api.post(`/projects/${projectId}/generate-from-figma`, data),

    // Enhanced Project APIs
    createEnhancedProject: (formData) => api.post('/enhanced-projects/create', formData),
    getProjectDetails: (projectId) => api.get(`/enhanced-projects/${projectId}/details`),
    updateProjectDetails: (projectId, data) => api.put(`/enhanced-projects/${projectId}/details`, data),
    generateProjectAnalysis: (projectId, options) => api.post(`/enhanced-projects/${projectId}/analyze`, options),
    generateEnhancedCode: (projectId, options) => api.post(`/enhanced-projects/${projectId}/generate-code`, options),
    
    // Enhanced save functionality
    saveProjectContent: (projectId, content, saveToFileSystem = false) => 
        api.post(`/enhanced-projects/${projectId}/save-content`, { content, saveToFileSystem }),
    saveFileContent: (projectId, fileName, content, saveToFileSystem = false) => 
        api.post(`/enhanced-projects/${projectId}/save-file`, { fileName, content, saveToFileSystem }),
    
    // Preview functionality
    getPreviewUrl: (projectId) => api.get(`/enhanced-projects/${projectId}/preview-url`),

    // Figma Integration
    processFigmaLink: (figmaUrl) => api.post('/figma/process', { figmaUrl }),
    getFigmaFile: (fileId) => api.get(`/figma/file/${fileId}`),
    convertFigmaComponent: (data) => api.post('/figma/convert', data),
};

export default api;

// Named exports for specific functions
export const generateCodeFromProject = (projectId) => 
    apiService.generateCodeFromProject(projectId).then(res => res.data);

export const generateFromFigma = (projectId, data) => 
    apiService.generateFromFigma(projectId, data).then(res => res.data);

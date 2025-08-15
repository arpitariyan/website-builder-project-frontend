// src/contexts/ProjectContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

// Project reducer
const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload, loading: false };
    
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [action.payload, ...state.projects] 
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        ),
        currentProject: state.currentProject?._id === action.payload._id 
          ? action.payload 
          : state.currentProject
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project._id !== action.payload),
        currentProject: state.currentProject?._id === action.payload 
          ? null 
          : state.currentProject
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'UPDATE_PROJECT_CONTENT':
      if (state.currentProject) {
        return {
          ...state,
          currentProject: {
            ...state.currentProject,
            content: { ...state.currentProject.content, ...action.payload }
          }
        };
      }
      return state;
    
    case 'UPDATE_PROJECT_SETTINGS':
      if (state.currentProject) {
        return {
          ...state,
          currentProject: {
            ...state.currentProject,
            settings: { ...state.currentProject.settings, ...action.payload }
          }
        };
      }
      return state;
    
    case 'SET_AUTO_SAVE_STATUS':
      return { ...state, autoSaveStatus: action.payload };
    
    default:
      return state;
  }
};

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  autoSaveStatus: 'saved' // 'saving', 'saved', 'error'
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.get('/projects');
      dispatch({ type: 'SET_PROJECTS', payload: response.data.projects });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch projects' });
      toast.error('Failed to load projects');
    }
  }, []);

  // Fetch specific project
  const fetchProject = useCallback(async (projectId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.get(`/projects/${projectId}`);
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: response.data.project });
    } catch (error) {
      console.error('Failed to fetch project:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch project' });
      toast.error('Failed to load project');
    }
  }, []);

  // Create new project
  const createProject = useCallback(async (projectData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Handle both FormData and regular objects
      const isFormData = projectData instanceof FormData;
      const endpoint = isFormData ? '/projects/enhanced/create' : '/projects/create';
      
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};
      
      const response = await apiService.post(endpoint, projectData, config);
      dispatch({ type: 'ADD_PROJECT', payload: response.data.project });
      toast.success('Project created successfully!');
      return response.data.project;
    } catch (error) {
      console.error('Failed to create project:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create project' });
      const errorMessage = error.response?.data?.error || 'Failed to create project';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (projectId, updates) => {
    try {
      const response = await apiService.put(`/projects/${projectId}`, updates);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data.project });
      return response.data.project;
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
      throw error;
    }
  }, []);

  // Auto-save project content
  const autoSaveProject = useCallback(async (projectId, content) => {
    if (!projectId) return;
    
    dispatch({ type: 'SET_AUTO_SAVE_STATUS', payload: 'saving' });
    try {
      await apiService.patch(`/projects/${projectId}/autosave`, { content });
      dispatch({ type: 'SET_AUTO_SAVE_STATUS', payload: 'saved' });
      dispatch({ type: 'UPDATE_PROJECT_CONTENT', payload: content });
    } catch (error) {
      console.error('Auto-save failed:', error);
      dispatch({ type: 'SET_AUTO_SAVE_STATUS', payload: 'error' });
    }
  }, []);

  // Duplicate project
  const duplicateProject = useCallback(async (projectId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.post(`/projects/${projectId}/duplicate`);
      dispatch({ type: 'ADD_PROJECT', payload: response.data.project });
      toast.success('Project duplicated successfully!');
      return response.data.project;
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to duplicate project' });
      toast.error('Failed to duplicate project');
      throw error;
    }
  }, []);

  // Publish project
  const publishProject = useCallback(async (projectId, subdomain) => {
    try {
      const response = await apiService.post(`/projects/${projectId}/publish`, { subdomain });
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data.project });
      toast.success('Project published successfully!');
      return response.data.publishedUrl;
    } catch (error) {
      console.error('Failed to publish project:', error);
      toast.error('Failed to publish project');
      throw error;
    }
  }, []);

  // Download project
  const downloadProject = useCallback(async (projectId) => {
    try {
      const response = await apiService.get(`/projects/${projectId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-${projectId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Project downloaded successfully!');
    } catch (error) {
      console.error('Failed to download project:', error);
      toast.error('Failed to download project');
      throw error;
    }
  }, []);

  // Delete project
  const deleteProject = useCallback(async (projectId) => {
    try {
      await apiService.delete(`/projects/${projectId}`);
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
      throw error;
    }
  }, []);

  // Update project content locally
  const updateProjectContent = useCallback((content) => {
    dispatch({ type: 'UPDATE_PROJECT_CONTENT', payload: content });
  }, []);

  // Update project settings locally
  const updateProjectSettings = useCallback((settings) => {
    dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: settings });
  }, []);

  // Clear current project
  const clearCurrentProject = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    autoSaveProject,
    duplicateProject,
    publishProject,
    downloadProject,
    deleteProject,
    updateProjectContent,
    updateProjectSettings,
    clearCurrentProject,
    clearError
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

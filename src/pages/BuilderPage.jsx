// src/pages/BuilderPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import EnhancedProjectBuilder from '../components/Builder/EnhancedProjectBuilder';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { FiArrowLeft, FiSave, FiEye, FiDownload, FiShare2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const BuilderPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentProject, 
    loading, 
    getProject, 
    updateProject, 
    saveProject 
  } = useProject();
  
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
  }, [projectId, getProject]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !currentProject) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        await saveProject(currentProject);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast.success('Auto-saved successfully', { duration: 2000 });
      } catch (error) {
        toast.error('Auto-save failed');
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [currentProject, hasUnsavedChanges, autoSaveEnabled, saveProject]);

  const handleSave = async () => {
    if (!currentProject) return;
    
    try {
      await saveProject(currentProject);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Project saved successfully');
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/preview/${projectId}`, '_blank');
  };

  const handlePublish = async () => {
    if (!currentProject) return;
    
    try {
      await updateProject(projectId, { 
        ...currentProject, 
        status: 'published',
        publishedAt: new Date()
      });
      toast.success('Project published successfully');
    } catch (error) {
      toast.error('Failed to publish project');
    }
  };

  const handleExport = () => {
    // Export project code
    toast.success('Exporting project...');
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    return lastSaved.toLocaleTimeString();
  };

  if (loading || !currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Toolbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs">
              {currentProject.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Last saved: {formatLastSaved()}</span>
              {hasUnsavedChanges && (
                <span className="text-orange-600">• Unsaved changes</span>
              )}
              {autoSaveEnabled && (
                <span className="text-green-600">• Auto-save on</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-save Toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Auto-save
          </label>

          {/* Action Buttons */}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            title="Save Project"
          >
            <FiSave className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={handlePreview}
            className="btn btn-outline inline-flex items-center gap-2"
            title="Preview Project"
          >
            <FiEye className="w-4 h-4" />
            Preview
          </button>

          <button
            onClick={handleExport}
            className="btn btn-outline inline-flex items-center gap-2"
            title="Export Code"
          >
            <FiDownload className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={handlePublish}
            className="btn btn-primary inline-flex items-center gap-2"
            title="Publish Project"
          >
            <FiShare2 className="w-4 h-4" />
            Publish
          </button>
        </div>
      </header>

      {/* Builder Interface */}
      <div className="flex-1 flex overflow-hidden">
        <EnhancedProjectBuilder 
          project={currentProject}
          onProjectChange={(updatedProject) => {
            setHasUnsavedChanges(true);
            // Update current project in context
            updateProject(projectId, updatedProject);
          }}
        />
      </div>
    </div>
  );
};

export default BuilderPage;

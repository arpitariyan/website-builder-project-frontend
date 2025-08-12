// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import DashBoard from '../components/Dashboard/DashBoard';
import CreateProjectEnhanced from '../components/Dashboard/CreateProjectEnhanced';
import Sidebar from '../components/UI/Sidebar';
import { FiPlus, FiGrid, FiList } from 'react-icons/fi';

const DashboardPage = () => {
  const { user } = useAuth();
  const { projects, fetchProjects, loading } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectCreated = (project) => {
    setShowCreateModal(false);
    navigate(`/project/${project._id}/details`);
  };

  const handleProjectDeleted = (projectId) => {
    // Refresh the projects list after deletion
    fetchProjects();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.displayName || user?.email}! Let's continue building amazing websites.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              {/* Create Project Button */}
              <button
                onClick={handleCreateProject}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner"></div>
                <span className="ml-3 text-gray-600">Loading projects...</span>
              </div>
            ) : (
              <DashBoard 
                projects={projects}
                viewMode={viewMode}
                onCreateProject={handleCreateProject}
                onProjectDeleted={handleProjectDeleted}
              />
            )}
          </div>
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectEnhanced
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default DashboardPage;

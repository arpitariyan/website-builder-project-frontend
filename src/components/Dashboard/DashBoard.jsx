// src/components/Dashboard/DashBoard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { FiPlus, FiSearch } from 'react-icons/fi';

const DashBoard = ({ projects, viewMode, onCreateProject, onProjectDeleted }) => {
  const recentProjects = projects.slice(0, 6);
  const stats = {
    total: projects.length,
    published: projects.filter(p => p.status === 'published').length,
    drafts: projects.filter(p => p.status === 'draft').length
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiSearch className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-yellow-600 rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {projects.length === 0 ? 'Get Started' : 'Your Projects'}
          </h2>
        </div>

        {projects.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 bg-white rounded-xl border border-gray-200"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPlus className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Your First Website
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building amazing websites with our drag-and-drop editor. 
              Choose from templates or start from scratch.
            </p>
            <button
              onClick={onCreateProject}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Create New Project
            </button>
          </motion.div>
        ) : (
          /* Projects Grid */
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {projects.map((project, index) => (
              <ProjectCard
                key={project._id}
                project={project}
                viewMode={viewMode}
                index={index}
                onProjectDeleted={onProjectDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to create something new?
              </h3>
              <p className="text-gray-600">
                Start with a template or build from scratch with our powerful editor.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onCreateProject}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashBoard;

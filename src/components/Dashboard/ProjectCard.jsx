// src/components/Dashboard/ProjectCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiCopy, FiTrash2, FiEye, FiMoreVertical, FiGlobe, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const ProjectCard = ({ project, viewMode, index }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    // Navigate to builder with project ID
    window.location.href = `/builder/${project._id}`;
  };

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/preview/${project._id}`, '_blank');
  };

  const handleDuplicate = () => {
    // Duplicate project logic
    console.log('Duplicate project:', project._id);
  };

  const handleDelete = () => {
    // Delete project logic
    if (window.confirm('Are you sure you want to delete this project?')) {
      console.log('Delete project:', project._id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {project.thumbnail ? (
                <img 
                  src={project.thumbnail} 
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {project.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </div>
                <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="Preview"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="More options"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleDuplicate}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <FiCopy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Project Thumbnail */}
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        {project.thumbnail ? (
          <img 
            src={project.thumbnail} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {project.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={handlePreview}
            className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Preview"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            title="Edit"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium border rounded-full backdrop-blur-sm ${getStatusColor(project.status)}`}>
            {project.status === 'published' && <FiGlobe className="w-3 h-3 inline mr-1" />}
            {project.status}
          </span>
        </div>

        {/* Menu Button */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-white bg-opacity-80 text-gray-700 rounded-lg hover:bg-opacity-100 transition-all backdrop-blur-sm"
            >
              <FiMoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleDuplicate}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                >
                  <FiCopy className="w-3 h-3" />
                  Duplicate
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FiTrash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{project.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {project.description || 'No description'}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-1">
            <span>v{project.version || '1.0'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;

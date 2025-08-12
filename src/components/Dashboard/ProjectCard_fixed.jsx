// src/components/Dashboard/ProjectCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiEdit3, FiTrash2, FiEye, FiMoreVertical, FiGlobe, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api';

const ProjectCard = ({ project, viewMode, index, onProjectDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    // Navigate to the enhanced builder page for editing
    navigate(`/enhanced-builder/${project._id}`);
  };

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/preview/${project._id}`, '_blank');
  };

  const handleDelete = async () => {
    try {
      // Delete project logic with confirmation
      if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
        setIsDeleting(true);
        setShowMenu(false);
        
        await apiService.deleteProject(project._id);
        toast.success('Project deleted successfully');
        
        // Notify parent component to refresh the project list
        if (onProjectDeleted && typeof onProjectDeleted === 'function') {
          onProjectDeleted(project._id);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
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
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <FiGlobe className="w-8 h-8 text-primary-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-1">{project.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <FiClock className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
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
            <div className="relative" ref={menuRef}>
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
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
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
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative overflow-hidden">
        {project.thumbnail ? (
          <img 
            src={project.thumbnail} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <FiGlobe className="w-12 h-12 text-primary-600 mx-auto mb-2" />
            <span className="text-primary-700 text-sm font-medium">Website Preview</span>
          </div>
        )}
        
        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors transform scale-0 group-hover:scale-100 duration-200"
              title="Preview"
            >
              <FiEye className="w-5 h-5" />
            </button>
            <button
              onClick={handleEdit}
              className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors transform scale-0 group-hover:scale-100 duration-200 delay-75"
              title="Edit"
            >
              <FiEdit3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
          </div>
          
          <div className="relative ml-2" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="More options"
            >
              <FiMoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status and timestamp */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <FiClock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePreview}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;

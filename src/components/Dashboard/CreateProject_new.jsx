// src/components/Dashboard/CreateProject.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFolder, FiImage, FiGlobe, FiCode, FiExternalLink } from 'react-icons/fi';
import { useProject } from '../../contexts/ProjectContext';
import { toast } from 'react-hot-toast';

const CreateProject = ({ isOpen, onClose, onProjectCreated }) => {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    category: 'business',
    isPublic: false,
    figmaUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const { createProject } = useProject();

  const categories = [
    { id: 'business', name: 'Business', icon: FiFolder, color: 'blue' },
    { id: 'portfolio', name: 'Portfolio', icon: FiImage, color: 'purple' },
    { id: 'ecommerce', name: 'E-commerce', icon: FiGlobe, color: 'green' },
    { id: 'landing', name: 'Landing Page', icon: FiCode, color: 'orange' },
    { id: 'blog', name: 'Blog', icon: FiCode, color: 'pink' },
    { id: 'other', name: 'Other', icon: FiFolder, color: 'gray' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setLoading(true);
    try {
      const project = await createProject(projectData);
      toast.success('Project created successfully!');
      onClose();
      // Call the callback with project data
      if (onProjectCreated) {
        onProjectCreated(project);
      } else {
        // Fallback navigation
        window.location.href = `/builder/${project._id}`;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[color] || colors.gray;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create New Project
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="px-6 py-6 space-y-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter project name..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={projectData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Describe your project..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Figma Integration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Figma Design Link (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={projectData.figmaUrl}
                        onChange={(e) => handleChange('figmaUrl', e.target.value)}
                        placeholder="https://www.figma.com/file/..."
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <FiExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Paste a Figma file or frame URL to automatically generate code from your design
                    </p>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        const isSelected = projectData.category === category.id;
                        
                        return (
                          <motion.button
                            key={category.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleChange('category', category.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? getCategoryColor(category.color)
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{category.name}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visibility Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Project Visibility
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!projectData.isPublic}
                          onChange={() => handleChange('isPublic', false)}
                          className="mt-1 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Private</div>
                          <div className="text-sm text-gray-500">
                            Only visible to you. Perfect for personal projects and drafts.
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="visibility"
                          checked={projectData.isPublic}
                          onChange={() => handleChange('isPublic', true)}
                          className="mt-1 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Public</div>
                          <div className="text-sm text-gray-500">
                            Visible to everyone. Great for showcasing your work.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !projectData.name.trim()}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateProject;

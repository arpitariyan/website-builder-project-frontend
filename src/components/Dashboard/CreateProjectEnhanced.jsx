// src/components/Dashboard/CreateProjectEnhanced.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiFolder, FiImage, FiGlobe, FiCode, FiExternalLink, 
  FiUpload, FiFile, FiTrash2, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import { useProject } from '../../contexts/ProjectContext';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api';

const CreateProjectEnhanced = ({ isOpen, onClose, onProjectCreated }) => {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    category: 'business',
    isPublic: false,
    figmaUrl: '',
    figmaFlows: ['Superadmin', 'Admin', 'User']
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { 
      id: 'business', 
      name: 'Business', 
      icon: FiFolder, 
      color: 'blue',
      description: 'Corporate websites, business portals',
      backendRequired: true
    },
    { 
      id: 'portfolio', 
      name: 'Portfolio', 
      icon: FiImage, 
      color: 'purple',
      description: 'Personal portfolios, showcases',
      backendRequired: false
    },
    { 
      id: 'e-commerce', 
      name: 'E-commerce', 
      icon: FiGlobe, 
      color: 'green',
      description: 'Online stores, marketplaces',
      backendRequired: true
    },
    { 
      id: 'landing-page', 
      name: 'Landing Page', 
      icon: FiCode, 
      color: 'orange',
      description: 'Marketing pages, product launches',
      backendRequired: false
    },
    { 
      id: 'blog', 
      name: 'Blog', 
      icon: FiCode, 
      color: 'pink',
      description: 'Blogs, news sites, content platforms',
      backendRequired: true
    },
    { 
      id: 'other', 
      name: 'Other', 
      icon: FiFolder, 
      color: 'gray',
      description: 'Custom projects',
      backendRequired: false
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (!projectData.description.trim()) {
      toast.error('Project description is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add project data
      Object.keys(projectData).forEach(key => {
        if (key === 'figmaFlows') {
          formData.append(key, JSON.stringify(projectData[key]));
        } else {
          formData.append(key, projectData[key]);
        }
      });
      
      // Add uploaded files
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await apiService.post('/projects/enhanced/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const project = response.data.project;
      toast.success('Project created successfully!');
      onClose();
      
      // Navigate to project details page
      if (onProjectCreated) {
        onProjectCreated(project);
      } else {
        window.location.href = `/project/${project._id}/details`;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.error || 'Failed to create project');
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

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(file => {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Only PDF and Word documents are allowed`);
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: File size must be less than 10MB`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...newFiles].slice(0, 3)); // Max 3 files
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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

  const selectedCategory = categories.find(cat => cat.id === projectData.category);

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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Create Enhanced Project
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
                <div className="px-6 py-6 space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    
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
                        Project Description *
                      </label>
                      <textarea
                        value={projectData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe your project in detail. Include features, target audience, and any specific requirements..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        The more detailed your description, the better AI can analyze and generate code for your project.
                      </p>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Additional Documentation (Optional)</h3>
                    
                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop files here or click to upload
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload Word documents or PDFs with project requirements (Max 3 files, 10MB each)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        Choose Files
                      </label>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FiFile className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Figma Integration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Design Integration (Optional)</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Figma Design Link
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
                        Paste your Figma file URL to automatically analyze your design and generate matching code
                      </p>
                    </div>

                    {projectData.figmaUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User Flows to Analyze (Up to 3)
                        </label>
                        <div className="space-y-2">
                          {projectData.figmaFlows.map((flow, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={flow}
                                onChange={(e) => {
                                  const newFlows = [...projectData.figmaFlows];
                                  newFlows[index] = e.target.value;
                                  handleChange('figmaFlows', newFlows);
                                }}
                                placeholder={`Flow ${index + 1} (e.g., "Admin Dashboard")`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                              {projectData.figmaFlows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFlows = projectData.figmaFlows.filter((_, i) => i !== index);
                                    handleChange('figmaFlows', newFlows);
                                  }}
                                  className="p-2 text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          {projectData.figmaFlows.length < 3 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleChange('figmaFlows', [...projectData.figmaFlows, '']);
                              }}
                              className="text-sm text-primary-600 hover:text-primary-700"
                            >
                              + Add Another Flow
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Project Category</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? getCategoryColor(category.color)
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            <Icon className="w-8 h-8 mb-3" />
                            <div className="font-medium mb-1">{category.name}</div>
                            <div className="text-xs opacity-75 mb-2">{category.description}</div>
                            {category.backendRequired && (
                              <div className="flex items-center gap-1 text-xs">
                                <FiCheckCircle className="w-3 h-3" />
                                Backend Required
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {selectedCategory?.backendRequired && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-2">
                          <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Backend Required</p>
                            <p className="text-sm text-blue-700">
                              This category typically requires backend functionality like databases, authentication, and APIs.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visibility Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Project Visibility</h3>
                    
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
                    disabled={loading || !projectData.name.trim() || !projectData.description.trim()}
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

export default CreateProjectEnhanced;

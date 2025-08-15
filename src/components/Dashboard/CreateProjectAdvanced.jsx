// src/components/Dashboard/CreateProjectAdvanced.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiFolder, FiImage, FiGlobe, FiCode, FiUpload, FiFile, 
  FiTrash2, FiCheckCircle, FiArrowRight, FiArrowLeft, FiSettings
} from 'react-icons/fi';
import { useProject } from '../../contexts/ProjectContext';
import { toast } from 'react-hot-toast';

const CreateProjectAdvanced = ({ isOpen, onClose, onProjectCreated }) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    category: '',
    additionalDocs: [],
    designFiles: [],
    backendRequired: false,
    frontendTech: '',
    backendTech: '',
    visibility: 'private'
  });
  const [loading, setLoading] = useState(false);
  const { createProject } = useProject();
  const fileInputRef = useRef(null);
  const designInputRef = useRef(null);

  const categories = [
    { 
      id: 'portfolio', 
      name: 'Portfolio', 
      icon: FiImage, 
      color: 'purple',
      description: 'Personal portfolios, showcases',
      backendRequired: false
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
      id: 'business', 
      name: 'Business', 
      icon: FiFolder, 
      color: 'blue',
      description: 'Business websites, company sites',
      backendRequired: true
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
      id: 'blog', 
      name: 'Blog', 
      icon: FiCode, 
      color: 'pink',
      description: 'Blogs, news sites, content platforms',
      backendRequired: true
    },
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: FiSettings, 
      color: 'indigo',
      description: 'Admin panels, data dashboards',
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

  const frontendOptions = [
    { id: 'html-css-js', name: 'HTML/CSS/JavaScript', description: 'Pure web technologies' },
    { id: 'react', name: 'React.js', description: 'Component-based library' },
    { id: 'react-vite', name: 'React + Vite', description: 'Fast build tool with React' },
    { id: 'next', name: 'Next.js', description: 'Full-stack React framework' }
  ];

  const backendOptions = [
    { id: 'node', name: 'Node.js', description: 'JavaScript runtime' },
    { id: 'express', name: 'Express.js', description: 'Node.js web framework' },
    { id: 'fastify', name: 'Fastify', description: 'Fast Node.js framework' }
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

    if (!projectData.category) {
      toast.error('Please select a project category');
      return;
    }

    if (projectData.backendRequired && !projectData.frontendTech) {
      toast.error('Please select frontend technology');
      return;
    }

    if (projectData.backendRequired && !projectData.backendTech) {
      toast.error('Please select backend technology');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add project data
      formData.append('name', projectData.name);
      formData.append('description', projectData.description);
      formData.append('category', projectData.category);
      formData.append('backendRequired', projectData.backendRequired);
      formData.append('frontendTech', projectData.frontendTech);
      formData.append('backendTech', projectData.backendTech);
      formData.append('visibility', projectData.visibility);
      
      // Add uploaded files
      [...projectData.additionalDocs, ...projectData.designFiles].forEach(file => {
        formData.append('files', file);
      });

      const project = await createProject(formData);
      toast.success('Project created successfully!');
      onClose();
      
      if (onProjectCreated) {
        onProjectCreated(project);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProjectData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-set backend requirement based on category
      if (field === 'category') {
        const category = categories.find(c => c.id === value);
        updated.backendRequired = category?.backendRequired || false;
      }
      
      return updated;
    });
  };

  const handleFileUpload = (files, type) => {
    const validFiles = Array.from(files).filter(file => {
      if (type === 'docs') {
        return file.type.includes('pdf') || file.type.includes('text') || file.type.includes('document');
      } else {
        return file.type.includes('image') || file.name.includes('.fig') || file.name.includes('.sketch');
      }
    });

    if (validFiles.length !== files.length) {
      toast.error(`Some files were skipped. Only ${type === 'docs' ? 'documents' : 'design files'} are allowed.`);
    }

    setProjectData(prev => ({
      ...prev,
      [type === 'docs' ? 'additionalDocs' : 'designFiles']: [
        ...prev[type === 'docs' ? 'additionalDocs' : 'designFiles'],
        ...validFiles
      ]
    }));
  };

  const removeFile = (index, type) => {
    setProjectData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (step === 1 && (!projectData.name.trim() || !projectData.description.trim())) {
      toast.error('Please fill in project name and description');
      return;
    }
    if (step === 2 && !projectData.category) {
      toast.error('Please select a project category');
      return;
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              <p className="text-gray-600">Tell us about your project</p>
            </div>

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
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Project Category</h3>
              <p className="text-gray-600">Choose the type of project you're building</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h4 className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                          {category.name}
                        </h4>
                        <p className={`text-sm mt-1 ${isSelected ? 'text-primary-700' : 'text-gray-500'}`}>
                          {category.description}
                        </p>
                        {category.backendRequired && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Backend Required
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <FiCheckCircle className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Additional Resources</h3>
              <p className="text-gray-600">Upload documentation and design files (optional)</p>
            </div>

            {/* Additional Documentation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional Documentation
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                <div className="text-center">
                  <FiFile className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload PDFs, text files, or documents
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => handleFileUpload(e.target.files, 'docs')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <FiUpload className="w-4 h-4 inline mr-2" />
                    Choose Files
                  </button>
                </div>
              </div>

              {projectData.additionalDocs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {projectData.additionalDocs.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiFile className="w-4 h-4 text-gray-500" />
                      <span className="flex-1 text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index, 'additionalDocs')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Design Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Design Integration
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                <div className="text-center">
                  <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload design files, mockups, or wireframes
                  </p>
                  <input
                    ref={designInputRef}
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.svg,.fig,.sketch"
                    onChange={(e) => handleFileUpload(e.target.files, 'design')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => designInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <FiUpload className="w-4 h-4 inline mr-2" />
                    Choose Files
                  </button>
                </div>
              </div>

              {projectData.designFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {projectData.designFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiImage className="w-4 h-4 text-gray-500" />
                      <span className="flex-1 text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index, 'designFiles')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Technical Configuration</h3>
              <p className="text-gray-600">Choose your technology stack</p>
            </div>

            {projectData.backendRequired && (
              <>
                {/* Frontend Technology */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Frontend Technology *
                  </label>
                  <div className="space-y-3">
                    {frontendOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleChange('frontendTech', option.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          projectData.frontendTech === option.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-medium ${
                              projectData.frontendTech === option.id ? 'text-primary-900' : 'text-gray-900'
                            }`}>
                              {option.name}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              projectData.frontendTech === option.id ? 'text-primary-700' : 'text-gray-500'
                            }`}>
                              {option.description}
                            </p>
                          </div>
                          {projectData.frontendTech === option.id && (
                            <FiCheckCircle className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Backend Technology */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Backend Technology *
                  </label>
                  <div className="space-y-3">
                    {backendOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleChange('backendTech', option.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          projectData.backendTech === option.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-medium ${
                              projectData.backendTech === option.id ? 'text-primary-900' : 'text-gray-900'
                            }`}>
                              {option.name}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              projectData.backendTech === option.id ? 'text-primary-700' : 'text-gray-500'
                            }`}>
                              {option.description}
                            </p>
                          </div>
                          {projectData.backendTech === option.id && (
                            <FiCheckCircle className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Project Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChange('visibility', 'private')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    projectData.visibility === 'private'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <h4 className={`font-medium ${
                      projectData.visibility === 'private' ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      Private
                    </h4>
                    <p className={`text-sm mt-1 ${
                      projectData.visibility === 'private' ? 'text-primary-700' : 'text-gray-500'
                    }`}>
                      Only you can see this project
                    </p>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChange('visibility', 'public')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    projectData.visibility === 'public'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <h4 className={`font-medium ${
                      projectData.visibility === 'public' ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      Public
                    </h4>
                    <p className={`text-sm mt-1 ${
                      projectData.visibility === 'public' ? 'text-primary-700' : 'text-gray-500'
                    }`}>
                      Others can view this project
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Create New Project
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>Step {step} of 4</span>
                    <span>{Math.round((step / 4) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: '25%' }}
                      animate={{ width: `${(step / 4) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className="bg-primary-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="px-6 py-6">
                  {renderStep()}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={step === 1}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    {step < 4 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center gap-2"
                      >
                        Next
                        <FiArrowRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
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
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectAdvanced;

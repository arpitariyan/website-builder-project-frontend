// src/pages/ProjectDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiEdit3, FiSettings, FiEye, FiCode, FiZap, FiRefreshCw, 
  FiFile, FiExternalLink, FiCheckCircle, FiClock, FiPlay,
  FiArrowLeft, FiSave
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/projects/enhanced/${projectId}/details`);
      const projectData = response.data.project;
      setProject(projectData);
      setEditData({
        name: projectData.name,
        description: projectData.description,
        category: projectData.category
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async (forceRegenerate = false) => {
    try {
      setAnalyzing(true);
      const response = await apiService.post(`/projects/enhanced/${projectId}/analyze`, {
        forceRegenerate
      });
      
      const analysis = response.data.analysis;
      
      setProject(prev => ({
        ...prev,
        aiAnalysis: analysis,
        status: 'ready'
      }));
      
      toast.success(response.data.cached ? 'Analysis loaded' : 'Analysis generated successfully!');
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate AI analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCodeGeneration = async () => {
    try {
      setGenerating(true);
      const response = await apiService.post(`/projects/enhanced/${projectId}/generate-code`, {
        component: 'full-project',
        options: {
          type: 'full-project'
        }
      });
      
      setProject(prev => ({
        ...prev,
        status: 'ready',
        content: response.data.code,
        aiGeneration: {
          provider: response.data.provider,
          model: response.data.model,
          generatedAt: new Date(),
          tokensUsed: response.data.tokensUsed
        }
      }));
      
      toast.success('Code generated successfully!');
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error(error.response?.data?.error || 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const handleEditSave = async () => {
    try {
      await apiService.put(`/projects/enhanced/${projectId}/details`, editData);
      setProject(prev => ({ ...prev, ...editData }));
      setEditing(false);
      toast.success('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      analyzing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      generating: 'bg-yellow-100 text-yellow-800',
      published: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.draft;
  };

  const getCategoryInfo = (category) => {
    const categories = {
      'business': { name: 'Business', color: 'blue' },
      'portfolio': { name: 'Portfolio', color: 'purple' },
      'e-commerce': { name: 'E-commerce', color: 'green' },
      'landing-page': { name: 'Landing Page', color: 'orange' },
      'blog': { name: 'Blog', color: 'pink' },
      'other': { name: 'Other', color: 'gray' }
    };
    return categories[category] || categories.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(project.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800`}>
                    {categoryInfo.name}
                  </span>
                  {project.backendRequired && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Backend Required
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <FiEdit3 className="w-4 h-4" />
                {editing ? 'Cancel' : 'Edit'}
              </button>
              
              {project.content && (
                <button
                  onClick={() => navigate(`/enhanced-builder/${projectId}`)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FiCode className="w-4 h-4" />
                  Open Builder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Project Information</h2>
                {editing && (
                  <button
                    onClick={handleEditSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiSave className="w-4 h-4" />
                    Save
                  </button>
                )}
              </div>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            {project.uploadedFiles && project.uploadedFiles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
                <div className="space-y-3">
                  {project.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiFile className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                            {file.hasParsedContent && (
                              <span className="ml-2 text-green-600">✓ Content extracted</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Figma Integration */}
            {project.figmaData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Figma Integration</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FiExternalLink className="w-4 h-4 text-gray-400" />
                    <a 
                      href={project.figmaData.figmaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View Figma File
                    </a>
                  </div>
                  
                  {project.figmaData.flowsAnalyzed > 0 && (
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">
                        {project.figmaData.flowsAnalyzed} design flows analyzed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Analysis Results */}
            {project.aiAnalysis && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiClock className="w-4 h-4" />
                    Version {project.aiAnalysis.version}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Generated Development Prompt</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {project.aiAnalysis.generatedPrompt}
                  </p>
                </div>
                
                {project.aiAnalysis.analysisData && (
                  <div className="space-y-3">
                    {Object.entries(project.aiAnalysis.analysisData).map(([key, value]) => (
                      value && (
                        <div key={key}>
                          <h4 className="font-medium text-gray-900 capitalize mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-600">{value}</p>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {/* AI Analysis */}
                <button
                  onClick={() => handleAIAnalysis(false)}
                  disabled={analyzing}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {analyzing ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiZap className="w-4 h-4" />
                  )}
                  {project.aiAnalysis ? 'View Analysis' : 'Generate AI Analysis'}
                </button>

                {/* Regenerate Analysis */}
                {project.aiAnalysis && (
                  <button
                    onClick={() => handleAIAnalysis(true)}
                    disabled={analyzing}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Regenerate Analysis
                  </button>
                )}

                {/* Generate Code */}
                {project.aiAnalysis && (
                  <button
                    onClick={handleCodeGeneration}
                    disabled={generating || !project.aiAnalysis.generatedPrompt}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiPlay className="w-4 h-4" />
                    )}
                    Generate Code
                  </button>
                )}

                {/* Open Builder */}
                {project.content && (
                  <button
                    onClick={() => navigate(`/enhanced-builder/${projectId}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                  >
                    <FiCode className="w-4 h-4" />
                    Open Code Editor
                  </button>
                )}
              </div>
            </div>

            {/* Project Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Visibility</span>
                  <span className={`text-sm font-medium ${
                    project.visibility === 'public' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {project.visibility === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>

                {project.analytics && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="text-sm font-medium text-gray-900">
                        {project.analytics.views || 0}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Likes</span>
                      <span className="text-sm font-medium text-gray-900">
                        {project.analytics.likes || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AI Generation Info */}
            {project.aiGeneration && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Generation</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Provider</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {project.aiGeneration.provider}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Model</span>
                    <span className="text-sm font-medium text-gray-900">
                      {project.aiGeneration.model}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tokens Used</span>
                    <span className="text-sm font-medium text-gray-900">
                      {project.aiGeneration.tokensUsed?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Generated</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(project.aiGeneration.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

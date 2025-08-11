// src/pages/TemplatesPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import Sidebar from '../components/UI/Sidebar';
import { FiSearch, FiFilter, FiEye, FiDownload } from 'react-icons/fi';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { createProject } = useProject();
  const navigate = useNavigate();

  // Mock templates data
  const mockTemplates = [
    {
      id: '1',
      name: 'Business Pro',
      description: 'Professional business website template with modern design',
      category: 'business',
      thumbnail: '/api/placeholder/400/300',
      previewUrl: '#',
      isPremium: false,
      rating: 4.8,
      usageCount: 1250
    },
    {
      id: '2',
      name: 'Creative Portfolio',
      description: 'Showcase your creative work with this stunning portfolio',
      category: 'portfolio',
      thumbnail: '/api/placeholder/400/300',
      previewUrl: '#',
      isPremium: true,
      rating: 4.9,
      usageCount: 890
    },
    {
      id: '3',
      name: 'E-commerce Store',
      description: 'Complete online store template with shopping cart',
      category: 'ecommerce',
      thumbnail: '/api/placeholder/400/300',
      previewUrl: '#',
      isPremium: false,
      rating: 4.7,
      usageCount: 2100
    },
    {
      id: '4',
      name: 'Restaurant Menu',
      description: 'Beautiful restaurant website with menu showcase',
      category: 'business',
      thumbnail: '/api/placeholder/400/300',
      previewUrl: '#',
      isPremium: false,
      rating: 4.6,
      usageCount: 567
    },
    {
      id: '5',
      name: 'Tech Startup',
      description: 'Modern startup landing page with clean design',
      category: 'landing',
      thumbnail: '/api/placeholder/400/300',
      previewUrl: '#',
      isPremium: true,
      rating: 4.9,
      usageCount: 1876
    },
    {
      id: '6',
      name: 'Personal Blog',
      description: 'Elegant blog template for personal content',
      category: 'blog',
      thumbnail: '/api/placeholder/400/300',
      previewUrl: '#',
      isPremium: false,
      rating: 4.5,
      usageCount: 432
    }
  ];

  const mockCategories = [
    { name: 'all', count: 6 },
    { name: 'business', count: 2 },
    { name: 'portfolio', count: 1 },
    { name: 'ecommerce', count: 1 },
    { name: 'landing', count: 1 },
    { name: 'blog', count: 1 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTemplates(mockTemplates);
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template) => {
    try {
      const projectData = {
        name: `${template.name} Project`,
        description: `Project based on ${template.name} template`,
        templateId: template.id
      };
      
      const project = await createProject(projectData);
      navigate(`/builder/${project._id}`);
    } catch (error) {
      console.error('Failed to create project from template:', error);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
              <p className="text-sm text-gray-600 mt-1">
                Choose from professionally designed templates to jumpstart your website
              </p>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.name
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  <span className="ml-1 text-xs opacity-75">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner"></div>
              <span className="ml-3 text-gray-600">Loading templates...</span>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                  {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="btn btn-ghost"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Template Image */}
                      <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-500">Template Preview</span>
                        </div>
                        
                        {/* Premium Badge */}
                        {template.isPremium && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              PRO
                            </span>
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-white text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                            <FiEye className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                          >
                            <FiDownload className="w-4 h-4" />
                            Use Template
                          </button>
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span>⭐</span>
                            <span>{template.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {template.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                            {template.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            Used {template.usageCount.toLocaleString()} times
                          </span>
                        </div>

                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="w-full mt-4 btn btn-ghost group-hover:btn-primary transition-all duration-300"
                        >
                          Use This Template
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TemplatesPage;

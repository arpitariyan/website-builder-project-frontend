// src/components/Builder/AICodeGenerator.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiZap, FiCpu, FiDatabase, FiSearch, FiCode,
  FiTrendingUp, FiBookOpen, FiTarget, FiRefreshCw,
  FiChevronDown, FiChevronUp, FiPlay, FiStopCircle
} from 'react-icons/fi';

const AICodeGenerator = ({
  project,
  knowledgeBase,
  generationStatus,
  onGenerate,
  onSearch,
  aiGenerating
}) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [generateForm, setGenerateForm] = useState({
    type: 'component',
    description: '',
    component: '',
    style: 'modern',
    features: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKnowledge, setExpandedKnowledge] = useState(false);

  const generateTypes = [
    { value: 'component', label: 'Component', icon: FiCode },
    { value: 'page', label: 'Full Page', icon: FiBookOpen },
    { value: 'service', label: 'Service/API', icon: FiCpu },
    { value: 'full-project', label: 'Complete Project', icon: FiTarget }
  ];

  const handleGenerate = async () => {
    if (!generateForm.description.trim()) return;

    await onGenerate({
      type: generateForm.type,
      description: generateForm.description,
      component: generateForm.component,
      options: {
        style: generateForm.style,
        features: generateForm.features
      }
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await onSearch(searchQuery);
  };

  const renderGenerationStatus = () => {
    if (!generationStatus.streaming && generationStatus.stage === 'idle') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {generationStatus.streaming ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiRefreshCw className="w-4 h-4 text-blue-400" />
              </motion.div>
            ) : (
              <FiZap className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm font-medium text-blue-300">
              {generationStatus.stage.charAt(0).toUpperCase() + generationStatus.stage.slice(1)}
            </span>
          </div>
          <span className="text-xs text-blue-400">
            {generationStatus.progress}%
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${generationStatus.progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <p className="text-xs text-gray-300">
          {generationStatus.message}
        </p>
        
        {generationStatus.currentFile && (
          <p className="text-xs text-blue-400 mt-1">
            📄 {generationStatus.currentFile}
          </p>
        )}
      </motion.div>
    );
  };

  const renderKnowledgeBase = () => (
    <div className="space-y-4">
      {/* Knowledge Stats */}
      {knowledgeBase.stats && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-400">Total Entries</div>
            <div className="text-lg font-semibold text-white">
              {knowledgeBase.stats.totalEntries}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-400">By Type</div>
            <div className="text-lg font-semibold text-white">
              {knowledgeBase.stats.byType?.length || 0}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={knowledgeBase.searching}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-2 rounded-lg transition-colors"
          >
            <FiSearch className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Results */}
      {knowledgeBase.results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">
              Search Results ({knowledgeBase.results.length})
            </h4>
            <button
              onClick={() => setExpandedKnowledge(!expandedKnowledge)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {expandedKnowledge ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
          
          <AnimatePresence>
            {expandedKnowledge && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 max-h-60 overflow-y-auto"
              >
                {knowledgeBase.results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-400">
                        {result.codeType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {(result.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {result.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>📊 {result.reusageCount} uses</span>
                      <span>✅ {(result.successRate * 100).toFixed(1)}% success</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Current Matches (during generation) */}
      {knowledgeBase.currentMatches > 0 && (
        <div className="bg-green-900/30 border border-green-500/30 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <FiCpu className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">
              Knowledge Match Found
            </span>
          </div>
          <p className="text-xs text-gray-300">
            Found {knowledgeBase.currentMatches} similar code patterns.
            AI will adapt existing knowledge for faster generation.
          </p>
          {knowledgeBase.topMatch && (
            <div className="mt-2 p-2 bg-gray-800 rounded">
              <p className="text-xs text-green-400">
                Top match: {knowledgeBase.topMatch.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <FiZap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">AI Core</h3>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Knowledge
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Generation Status */}
        {renderGenerationStatus()}
        
        {activeTab === 'generate' ? (
          <div className="space-y-4">
            {/* Generation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What do you want to generate?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {generateTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setGenerateForm(prev => ({ ...prev, type: type.value }))}
                      className={`p-3 rounded-lg border transition-colors ${
                        generateForm.type === type.value
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Describe what you want to build
              </label>
              <textarea
                value={generateForm.description}
                onChange={(e) => setGenerateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="E.g., Create a responsive navigation bar with dark mode toggle..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>

            {/* Component Name (for component type) */}
            {generateForm.type === 'component' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Component Name (optional)
                </label>
                <input
                  type="text"
                  value={generateForm.component}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, component: e.target.value }))}
                  placeholder="MyComponent"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Style Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Style Preference
              </label>
              <select
                value={generateForm.style}
                onChange={(e) => setGenerateForm(prev => ({ ...prev, style: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="modern">Modern & Clean</option>
                <option value="minimal">Minimal</option>
                <option value="bold">Bold & Colorful</option>
                <option value="professional">Professional</option>
                <option value="creative">Creative & Unique</option>
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Features
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Responsive',
                  'Dark Mode',
                  'Animations',
                  'Accessibility',
                  'TypeScript',
                  'Tests'
                ].map((feature) => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={generateForm.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGenerateForm(prev => ({
                            ...prev,
                            features: [...prev.features, feature]
                          }));
                        } else {
                          setGenerateForm(prev => ({
                            ...prev,
                            features: prev.features.filter(f => f !== feature)
                          }));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={aiGenerating || !generateForm.description.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {aiGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiRefreshCw className="w-5 h-5" />
                  </motion.div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FiPlay className="w-5 h-5" />
                  <span>Generate Code</span>
                </>
              )}
            </button>
          </div>
        ) : (
          renderKnowledgeBase()
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>AI-Powered Builder</span>
          {project && (
            <span>{project.frontendTech || 'React'} • {project.category}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICodeGenerator;

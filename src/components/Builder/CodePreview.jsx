// src/components/Builder/CodePreview.jsx
import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { motion } from 'framer-motion';
import { FiCopy, FiDownload, FiPlay, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CodePreview = ({ project, generatedCode, onCodeChange, isGenerating }) => {
  const [activeTab, setActiveTab] = useState('html');
  const [editorOptions] = useState({
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Fira Code, Consolas, Monaco, monospace'
  });

  const tabs = [
    { id: 'html', label: 'HTML', language: 'html' },
    { id: 'css', label: 'CSS', language: 'css' },
    { id: 'js', label: 'JavaScript', language: 'javascript' }
  ];

  const getCodeContent = () => {
    if (!generatedCode) {
      return {
        html: '<!-- Generated HTML will appear here -->',
        css: '/* Generated CSS will appear here */',
        js: '// Generated JavaScript will appear here'
      };
    }

    return {
      html: generatedCode.html || '<!-- No HTML generated -->',
      css: generatedCode.css || '/* No CSS generated */',
      js: generatedCode.js || '// No JavaScript generated'
    };
  };

  const codeContent = getCodeContent();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeContent[activeTab]);
      toast.success(`${activeTab.toUpperCase()} code copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownloadCode = () => {
    const content = codeContent[activeTab];
    const fileName = `${project.name || 'project'}.${activeTab === 'js' ? 'js' : activeTab}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${fileName} downloaded successfully!`);
  };

  const handleCodeEdit = (newValue) => {
    if (onCodeChange) {
      onCodeChange({
        ...codeContent,
        [activeTab]: newValue
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </div>
            )}
            
            <button
              onClick={handleCopyCode}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              title="Copy code"
            >
              <FiCopy className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleDownloadCode}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              title="Download code"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        <MonacoEditor
          language={tabs.find(tab => tab.id === activeTab)?.language || 'html'}
          theme="vs-dark"
          value={codeContent[activeTab]}
          options={editorOptions}
          onChange={handleCodeEdit}
        />
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Lines: {codeContent[activeTab].split('\n').length}
          </span>
          <span>
            Characters: {codeContent[activeTab].length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodePreview;

// src/components/Builder/LivePreview.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ComponentRenderer from './ComponentRenderer';

const LivePreview = ({ project }) => {
  const components = project?.content?.components || [];
  const customCode = project?.content?.customCode || '';

  const generateHTML = () => {
    const htmlComponents = components.map(component => {
      // This would generate clean HTML for each component
      // For now, we'll render them as React components
      return component;
    });

    return htmlComponents;
  };

  const generateCSS = () => {
    // Generate CSS from component styles
    let css = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        line-height: 1.6;
      }
    `;

    // Add custom CSS if provided
    if (customCode) {
      css += `\n${customCode}`;
    }

    return css;
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Preview Header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-gray-900">Live Preview</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Live</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Responsive Preview Buttons */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded font-medium">
              Desktop
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded">
              Tablet
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded">
              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        <style dangerouslySetInnerHTML={{ __html: generateCSS() }} />
        
        {components.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nothing to Preview
              </h3>
              <p className="text-gray-600">
                Add some components to see the live preview
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            {components.map((component, index) => (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ComponentRenderer
                  component={component}
                  isSelected={false}
                  onUpdate={() => {}} // No editing in preview mode
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Preview Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Preview Mode - {components.length} components rendered
          </div>
          <div className="flex items-center gap-4">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <button
              onClick={() => window.open(`/preview/${project._id}`, '_blank')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;

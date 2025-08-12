// src/components/Builder/EnhancedLivePreview.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiExternalLink, FiRefreshCw } from 'react-icons/fi';

const EnhancedLivePreview = ({ project, generatedCode, onRefresh }) => {
  const [viewMode, setViewMode] = useState('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  const viewModes = [
    { id: 'desktop', label: 'Desktop', icon: FiMonitor, width: '100%' },
    { id: 'tablet', label: 'Tablet', icon: FiTablet, width: '768px' },
    { id: 'mobile', label: 'Mobile', icon: FiSmartphone, width: '375px' }
  ];

  const generateFullHTML = () => {
    const components = project?.content?.components || [];
    const customCode = project?.content?.customCode || '';
    
    // Use generated code if available, otherwise fallback to basic HTML
    const html = generatedCode?.html || generateBasicHTML(components);
    const css = generatedCode?.css || generateBasicCSS();
    const js = generatedCode?.js || '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project?.name || 'Live Preview'}</title>
    <style>
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
            background: white;
        }
        
        ${css}
        ${customCode}
    </style>
</head>
<body>
    ${html}
    <script>
        ${js}
        
        // Prevent page navigation in preview
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault();
                console.log('Link clicked:', e.target.href);
            }
        });
        
        // Auto-resize iframe to content
        function resizeParent() {
            try {
                window.parent.postMessage({
                    type: 'IFRAME_RESIZE',
                    height: document.body.scrollHeight
                }, '*');
            } catch (e) {
                console.log('Could not resize iframe');
            }
        }
        
        window.addEventListener('load', resizeParent);
        window.addEventListener('resize', resizeParent);
        
        // Observe DOM changes
        const observer = new MutationObserver(resizeParent);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    </script>
</body>
</html>`;
  };

  const generateBasicHTML = (components) => {
    if (!components || components.length === 0) {
      return `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; color: #6b7280;">
          <div>
            <div style="font-size: 3rem; margin-bottom: 1rem;">👁️</div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">
              Nothing to Preview
            </h3>
            <p>Add some components to see the live preview</p>
          </div>
        </div>`;
    }

    return components.map(component => {
      switch (component.type) {
        case 'text':
          return `<p style="font-size: ${component.props?.fontSize || '16px'}; color: ${component.props?.color || '#000'};">${component.props?.content || 'Text'}</p>`;
        case 'heading':
          const level = component.props?.level || 'h2';
          return `<${level} style="font-size: ${component.props?.fontSize || '24px'}; color: ${component.props?.color || '#000'};">${component.props?.content || 'Heading'}</${level}>`;
        case 'button':
          return `<button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">${component.props?.text || 'Button'}</button>`;
        case 'image':
          return `<img src="${component.props?.src || 'https://via.placeholder.com/300x200'}" alt="${component.props?.alt || 'Image'}" style="max-width: 100%; height: auto;" />`;
        case 'container':
          return `<div style="padding: ${component.props?.padding || '20px'}; background: ${component.props?.backgroundColor || 'transparent'};">${component.children?.map(child => generateBasicHTML([child])).join('') || ''}</div>`;
        default:
          return `<div>Unknown component: ${component.type}</div>`;
      }
    }).join('\n');
  };

  const generateBasicCSS = () => {
    return `
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .text-center {
        text-align: center;
      }
      
      .mb-4 {
        margin-bottom: 1rem;
      }
      
      .mt-4 {
        margin-top: 1rem;
      }
    `;
  };

  const updateIframe = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generateFullHTML());
        doc.close();
        setTimeout(() => setIsLoading(false), 500);
      }
    }
  };

  useEffect(() => {
    updateIframe();
  }, [project, generatedCode]);

  const handleRefresh = () => {
    updateIframe();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getViewportStyles = () => {
    const mode = viewModes.find(m => m.id === viewMode);
    return {
      width: mode?.width || '100%',
      maxWidth: mode?.width || '100%',
      margin: viewMode !== 'desktop' ? '0 auto' : '0'
    };
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900">Live Preview</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="text-gray-600">{isLoading ? 'Loading...' : 'Live'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Viewport Controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      viewMode === mode.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={mode.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh preview"
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => {
                  const newWindow = window.open('', '_blank');
                  newWindow.document.write(generateFullHTML());
                  newWindow.document.close();
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open in new window"
              >
                <FiExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4">
        <motion.div
          layout
          className="h-full"
          style={getViewportStyles()}
        >
          <div className="relative h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiRefreshCw className="w-5 h-5 animate-spin" />
                  <span>Loading preview...</span>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
            />
          </div>
        </motion.div>
      </div>

      {/* Preview Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              {project?.content?.components?.length || 0} components
            </span>
            <span>
              Viewport: {viewModes.find(m => m.id === viewMode)?.label}
            </span>
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLivePreview;

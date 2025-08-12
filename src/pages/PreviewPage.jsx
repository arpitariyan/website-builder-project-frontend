// src/pages/PreviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';

const PreviewPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProject(projectId);
        setProject(response.data.project);
        setError(null);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested project could not be found.'}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  // Render the project content
  const renderProjectContent = () => {
    if (!project.content) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Content Available</h1>
            <p className="text-gray-600">This project doesn't have any content to preview yet.</p>
          </div>
        </div>
      );
    }

    // Create a complete HTML document with the project content
    const htmlContent = project.content.html || '';
    const cssContent = project.content.css || '';
    const jsContent = project.content.js || '';

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.name}</title>
        <style>
          ${cssContent}
        </style>
        ${htmlContent.includes('tailwindcss') ? '' : '<script src="https://cdn.tailwindcss.com"></script>'}
      </head>
      <body>
        ${htmlContent.includes('<body>') ? htmlContent.replace(/.*<body[^>]*>|<\/body>.*/gi, '') : htmlContent}
        <script>
          ${jsContent}
        </script>
      </body>
      </html>
    `;

    return (
      <iframe
        srcDoc={fullHtml}
        title={`Preview of ${project.name}`}
        className="w-full h-screen border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
      />
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with project info */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <span className="px-2 py-1 bg-gray-700 text-xs rounded">Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">
            Last updated: {new Date(project.lastSaved || project.updatedAt).toLocaleDateString()}
          </span>
          <button
            onClick={() => window.close()}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Project content */}
      <div className="w-full h-[calc(100vh-60px)]">
        {renderProjectContent()}
      </div>
    </div>
  );
};

export default PreviewPage;

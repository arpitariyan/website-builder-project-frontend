// src/components/Builder/EnhancedCodeEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Split from 'react-split';
import { 
  FiCode, FiEye, FiSave, FiDownload, FiRefreshCw, 
  FiSettings, FiMaximize2, FiMinimize2, FiPlay,
  FiFile, FiFolder
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api';

// Monaco Editor for syntax highlighting
import Editor from '@monaco-editor/react';

const EnhancedCodeEditor = ({ project, onProjectChange }) => {
  const [activeFile, setActiveFile] = useState('index.html');
  const [files, setFiles] = useState({});
  const [previewContent, setPreviewContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'public']));
  
  const previewRef = useRef(null);

  useEffect(() => {
    if (project?.content) {
      initializeFiles();
    }
  }, [project]);

  useEffect(() => {
    updatePreview();
  }, [files, activeFile]);

  const initializeFiles = () => {
    const newFiles = {};
    
    // Initialize basic structure
    if (project.category === 'portfolio' || project.category === 'landing-page') {
      // Simple HTML/CSS/JS structure
      newFiles['index.html'] = project.content.html || `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root">
        <!-- Your content will be generated here -->
        <h1 class="text-4xl font-bold text-center mt-10">Welcome to ${project.name}</h1>
        <p class="text-center mt-4 text-gray-600">${project.description}</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`;
      
      newFiles['styles.css'] = project.content.css || `/* Custom styles for ${project.name} */
body {
    font-family: 'Inter', sans-serif;
}

.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`;
      
      newFiles['script.js'] = project.content.js || `// JavaScript for ${project.name}
console.log('Welcome to ${project.name}');

// Add your interactive functionality here
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded successfully');
});`;
    } else {
      // React structure for complex projects
      newFiles['src/App.jsx'] = project.content.components?.[0]?.code || `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">${project.name}</h1>
        <p className="mt-2">${project.description}</p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome to your project!</h2>
        <p className="text-gray-600">
          This is your ${project.category} project. Start building amazing features!
        </p>
      </main>
    </div>
  );
}

export default App;`;

      newFiles['src/App.css'] = project.content.css || `/* App styles */
.App {
  min-height: 100vh;
  background: #f9fafb;
}

/* Add your custom styles here */`;

      newFiles['src/main.jsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`;

      newFiles['src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

      newFiles['package.json'] = JSON.stringify({
        name: project.name.toLowerCase().replace(/\s+/g, '-'),
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          "@types/react": "^18.2.15",
          "@types/react-dom": "^18.2.7",
          "@vitejs/plugin-react": "^4.0.3",
          autoprefixer: "^10.4.14",
          postcss: "^8.4.24",
          tailwindcss: "^3.3.0",
          vite: "^4.4.5"
        }
      }, null, 2);

      newFiles['index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

      if (project.backendRequired) {
        // Add backend files
        newFiles['server/app.js'] = `const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${project.name.toLowerCase()}', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${project.name} API' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;

        newFiles['server/package.json'] = JSON.stringify({
          name: `${project.name.toLowerCase().replace(/\s+/g, '-')}-server`,
          version: "1.0.0",
          description: `Backend for ${project.name}`,
          main: "app.js",
          scripts: {
            start: "node app.js",
            dev: "nodemon app.js"
          },
          dependencies: {
            express: "^4.18.2",
            mongoose: "^7.4.0",
            cors: "^2.8.5",
            dotenv: "^16.3.1"
          },
          devDependencies: {
            nodemon: "^3.0.1"
          }
        }, null, 2);
      }
    }

    setFiles(newFiles);
    setActiveFile(Object.keys(newFiles)[0]);
  };

  const updatePreview = () => {
    if (files['index.html']) {
      // For HTML projects, inject CSS and JS
      let html = files['index.html'];
      
      if (files['styles.css']) {
        html = html.replace('</head>', `<style>${files['styles.css']}</style></head>`);
      }
      
      if (files['script.js']) {
        html = html.replace('</body>', `<script>${files['script.js']}</script></body>`);
      }
      
      setPreviewContent(html);
    } else if (files['src/App.jsx']) {
      // For React projects, show a simplified preview
      const reactPreview = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${files['src/App.css'] || ''}</style>
</head>
<body>
    <div id="root">
        <div class="min-h-screen bg-gray-50">
            <header class="bg-blue-600 text-white p-6">
                <h1 class="text-3xl font-bold">${project.name}</h1>
                <p class="mt-2">${project.description}</p>
            </header>
            <main class="container mx-auto px-4 py-8">
                <h2 class="text-2xl font-semibold mb-4">React Preview</h2>
                <p class="text-gray-600">This is a preview of your React application.</p>
                <div class="mt-6 p-4 bg-white rounded-lg shadow">
                    <p class="text-sm text-gray-500">Note: This is a simplified preview. For full React functionality, use the development server.</p>
                </div>
            </main>
        </div>
    </div>
</body>
</html>`;
      setPreviewContent(reactPreview);
    }
  };

  const handleFileChange = (filename, content) => {
    setFiles(prev => ({
      ...prev,
      [filename]: content
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        content: {
          html: files['index.html'] || '',
          css: files['styles.css'] || files['src/App.css'] || '',
          js: files['script.js'] || '',
          components: files['src/App.jsx'] ? [{ 
            id: 'main-app',
            type: 'App',
            code: files['src/App.jsx']
          }] : [],
          files: Object.keys(files).map(filename => ({
            filename,
            content: files[filename]
          }))
        }
      };

      await apiService.put(`/projects/${project._id}`, updateData);
      toast.success('Project saved successfully!');
      
      if (onProjectChange) {
        onProjectChange({ ...project, ...updateData });
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    // Create and download project files
    const zip = new JSZip();
    
    Object.entries(files).forEach(([filename, content]) => {
      zip.file(filename, content);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop();
    const icons = {
      html: '🌐',
      css: '🎨',
      js: '⚡',
      jsx: '⚛️',
      json: '📋',
      md: '📝'
    };
    return icons[ext] || '📄';
  };

  const getEditorLanguage = (filename) => {
    const ext = filename.split('.').pop();
    const languages = {
      html: 'html',
      css: 'css',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      md: 'markdown'
    };
    return languages[ext] || 'text';
  };

  const renderFileTree = () => {
    const fileEntries = Object.keys(files);
    const folders = {};
    const rootFiles = [];

    // Organize files into folders
    fileEntries.forEach(filename => {
      const parts = filename.split('/');
      if (parts.length > 1) {
        const folder = parts[0];
        if (!folders[folder]) folders[folder] = [];
        folders[folder].push(filename);
      } else {
        rootFiles.push(filename);
      }
    });

    return (
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Files</h3>
        
        {/* Root files */}
        {rootFiles.map(filename => (
          <div
            key={filename}
            onClick={() => setActiveFile(filename)}
            className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer rounded hover:bg-gray-100 ${
              activeFile === filename ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
            }`}
          >
            <span>{getFileIcon(filename)}</span>
            <span>{filename}</span>
          </div>
        ))}

        {/* Folders */}
        {Object.entries(folders).map(([folder, folderFiles]) => (
          <div key={folder} className="mt-2">
            <div
              onClick={() => {
                const newExpanded = new Set(expandedFolders);
                if (newExpanded.has(folder)) {
                  newExpanded.delete(folder);
                } else {
                  newExpanded.add(folder);
                }
              setExpandedFolders(newExpanded);
            }}
            className="flex items-center gap-1 px-2 py-1 text-sm cursor-pointer rounded hover:bg-gray-100 text-gray-700"
          >
            {expandedFolders.has(folder) ? <FiFolder className="w-4 h-4 text-blue-600" /> : <FiFolder className="w-4 h-4" />}
            <span className="font-medium">{folder}</span>
          </div>            {expandedFolders.has(folder) && (
              <div className="ml-6 mt-1">
                {folderFiles.map(filename => (
                  <div
                    key={filename}
                    onClick={() => setActiveFile(filename)}
                    className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer rounded hover:bg-gray-100 ${
                      activeFile === filename ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span>{getFileIcon(filename)}</span>
                    <span>{filename.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} bg-gray-100`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{project.name} - Code Editor</h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FiFile className="w-4 h-4" />
              {activeFile}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              Save
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiDownload className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-gray-600 hover:text-gray-900"
            >
              {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100%-57px)]">
        <Split
          sizes={[20, 50, 30]}
          minSize={200}
          expandToMin={false}
          gutterSize={4}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className="flex w-full"
        >
          {/* File Explorer */}
          <div className="bg-white border-r border-gray-200 overflow-y-auto">
            {renderFileTree()}
          </div>

          {/* Code Editor */}
          <div className="bg-white border-r border-gray-200">
            <div className="h-full">
              <Editor
                height="100%"
                language={getEditorLanguage(activeFile)}
                value={files[activeFile] || ''}
                onChange={(value) => handleFileChange(activeFile, value || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  tabSize: 2,
                  insertSpaces: true
                }}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white">
            <div className="border-b border-gray-200 px-4 py-2">
              <div className="flex items-center gap-2">
                <FiEye className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Live Preview</span>
              </div>
            </div>
            
            <div className="h-[calc(100%-41px)]">
              <iframe
                ref={previewRef}
                srcDoc={previewContent}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Live Preview"
              />
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
};

export default EnhancedCodeEditor;

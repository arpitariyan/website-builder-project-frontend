// src/components/Builder/EnhancedCodeEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Split from 'react-split';
import { useNavigate } from 'react-router-dom';
import { 
  FiCode, FiEye, FiSave, FiDownload, FiRefreshCw, 
  FiSettings, FiMaximize2, FiMinimize2, FiPlay,
  FiFile, FiFolder, FiTerminal, FiFolderPlus,
  FiSearch, FiGitBranch, FiPackage, FiArrowLeft,
  FiHome, FiUpload, FiShare, FiZap,
  FiEdit, FiCommand, FiMenu, FiX, FiChevronRight,
  FiChevronDown, FiFileText, FiActivity, FiCheck
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api';
import { 
  generatePackageJson, 
  generateReactApp, 
  generateReactIndex, 
  generateHtmlTemplate,
  generateExpressServer,
  generateApiRoutes,
  generateStaticHtml,
  generateBasicCss,
  generateBasicJs
} from '../../utils/codeTemplates';

// Monaco Editor for syntax highlighting
import Editor from '@monaco-editor/react';

const EnhancedCodeEditor = ({ project, onProjectChange }) => {
  const navigate = useNavigate();
  const [activeFile, setActiveFile] = useState('index.html');
  const [files, setFiles] = useState({});
  const [previewContent, setPreviewContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [building, setBuilding] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'public', 'backend']));
  const [showMenuBar, setShowMenuBar] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showProblems, setShowProblems] = useState(false);
  const [problems, setProblems] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [buildLogs, setBuildLogs] = useState([]);
  const [selectedView, setSelectedView] = useState('code'); // code, preview, split
  
  const previewRef = useRef(null);
  const editorRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (project) {
      initializeProject();
    }
  }, [project]);

  useEffect(() => {
    updatePreview();
  }, [files, activeFile]);

  const initializeProject = async () => {
    if (project?.content) {
      initializeFiles();
    } else if (project && !project.content) {
      // Generate code if not already generated
      await generateProjectCode();
    }
  };

  const generateProjectCode = async () => {
    try {
      setIsGeneratingCode(true);
      addTerminalOutput('🚀 Starting AI code generation...', 'info');
      
      const response = await apiService.post(`/projects/enhanced/${project._id}/generate-code`, {
        component: 'full-project',
        options: {
          type: 'full-project',
          includeBackend: project.backendRequired,
          frontendTech: project.frontendTech || 'react',
          backendTech: project.backendTech || 'express'
        }
      });
      
      const generatedFiles = response.data.files || {};
      setFiles(generatedFiles);
      
      // Update project with generated content
      const updatedProject = {
        ...project,
        content: generatedFiles,
        status: 'ready'
      };
      
      if (onProjectChange) {
        onProjectChange(updatedProject);
      }
      
      addTerminalOutput('✅ Code generation completed successfully!', 'success');
      toast.success('Code generated successfully!');
      
      // Auto-run build if available
      setTimeout(() => {
        runBuild();
      }, 1000);
      
    } catch (error) {
      console.error('Error generating code:', error);
      addTerminalOutput('❌ Code generation failed: ' + (error.response?.data?.error || error.message), 'error');
      toast.error('Failed to generate code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const initializeFiles = () => {
    const newFiles = {};
    
    if (project.content && typeof project.content === 'object') {
      // Use existing generated content
      setFiles(project.content);
      const fileKeys = Object.keys(project.content);
      if (fileKeys.length > 0) {
        setActiveFile(fileKeys[0]);
      }
      return;
    }
    
    // Initialize basic structure based on project type
    if (project.backendRequired) {
      // Full-stack project structure
      newFiles['frontend/package.json'] = {
        content: generatePackageJson('frontend'),
        language: 'json'
      };
      newFiles['frontend/src/App.jsx'] = {
        content: generateReactApp(project),
        language: 'javascript'
      };
      newFiles['frontend/src/index.js'] = {
        content: generateReactIndex(),
        language: 'javascript'
      };
      newFiles['frontend/public/index.html'] = {
        content: generateHtmlTemplate(project),
        language: 'html'
      };
      
      // Backend files
      newFiles['backend/package.json'] = {
        content: generatePackageJson('backend'),
        language: 'json'
      };
      newFiles['backend/server.js'] = {
        content: generateExpressServer(project),
        language: 'javascript'
      };
      newFiles['backend/routes/api.js'] = {
        content: generateApiRoutes(project),
        language: 'javascript'
      };
      
      setActiveFile('frontend/src/App.jsx');
    } else {
      // Frontend-only project
      if (project.frontendTech === 'react' || project.frontendTech === 'react-vite') {
        newFiles['package.json'] = {
          content: generatePackageJson('frontend'),
          language: 'json'
        };
        newFiles['src/App.jsx'] = {
          content: generateReactApp(project),
          language: 'javascript'
        };
        newFiles['src/index.js'] = {
          content: generateReactIndex(),
          language: 'javascript'
        };
        newFiles['public/index.html'] = {
          content: generateHtmlTemplate(project),
          language: 'html'
        };
        setActiveFile('src/App.jsx');
      } else {
        // HTML/CSS/JS project
        newFiles['index.html'] = {
          content: generateStaticHtml(project),
          language: 'html'
        };
        newFiles['styles.css'] = {
          content: generateBasicCss(project),
          language: 'css'
        };
        newFiles['script.js'] = {
          content: generateBasicJs(project),
          language: 'javascript'
        };
        setActiveFile('index.html');
      }
    }
    
    setFiles(newFiles);
  };

  const addTerminalOutput = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [...prev, { message, type, timestamp }]);
  };

  const updatePreview = () => {
    if (files['index.html']) {
      // For HTML projects, inject CSS and JS
      let html = files['index.html'].content || '';
      const css = files['styles.css']?.content || '';
      const js = files['script.js']?.content || '';
      
      if (css) {
        html = html.replace('</head>', '<style>' + css + '</style></head>');
      }
      if (js) {
        html = html.replace('</body>', '<script>' + js + '</script></body>');
      }
      
      setPreviewContent(html);
    } else if (files['src/App.jsx'] || files['frontend/src/App.jsx']) {
      // For React projects, create a simple preview
      const appFile = files['src/App.jsx'] || files['frontend/src/App.jsx'];
      if (appFile) {
        const basicHtml = '<!DOCTYPE html><html><head><title>' + project.name + '</title></head><body><div id="root">React Component Preview</div></body></html>';
        setPreviewContent(basicHtml);
      }
    }
  };

  const runBuild = async () => {
    try {
      setBuilding(true);
      addTerminalOutput('🔨 Starting build process...', 'info');
      
      // Simulate build process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addTerminalOutput('✅ Build completed successfully!', 'success');
      setBuildLogs(['Build completed successfully']);
      
    } catch (error) {
      addTerminalOutput('❌ Build failed: ' + error.message, 'error');
    } finally {
      setBuilding(false);
    }
  };

  const saveProject = async () => {
    try {
      setSaving(true);
      
      const response = await apiService.put(`/projects/enhanced/${project._id}/content`, {
        content: files
      });
      
      if (onProjectChange) {
        onProjectChange({ ...project, content: files });
      }
      
      addTerminalOutput('💾 Project saved successfully!', 'success');
      toast.success('Project saved!');
      
    } catch (error) {
      console.error('Error saving project:', error);
      addTerminalOutput('❌ Save failed: ' + error.message, 'error');
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const downloadProject = () => {
    // Create a simple zip-like download
    const projectContent = Object.entries(files).map(([path, file]) => {
      return `// File: ${path}\n${file.content}\n\n`;
    }).join('---FILE_SEPARATOR---\n\n');
    
    const blob = new Blob([projectContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addTerminalOutput('📦 Project downloaded successfully!', 'success');
    toast.success('Project downloaded!');
  };

  const publishProject = async () => {
    try {
      setPublishing(true);
      addTerminalOutput('🚀 Publishing project...', 'info');
      
      const response = await apiService.post(`/projects/enhanced/${project._id}/publish`);
      
      addTerminalOutput('✅ Project published successfully!', 'success');
      toast.success('Project published!');
      
      if (response.data.url) {
        addTerminalOutput(`🌐 Live URL: ${response.data.url}`, 'info');
      }
      
    } catch (error) {
      console.error('Error publishing project:', error);
      addTerminalOutput('❌ Publish failed: ' + error.message, 'error');
      toast.error('Failed to publish project');
    } finally {
      setPublishing(false);
    }
  };

  const regenerateWithAI = async () => {
    try {
      setGenerating(true);
      addTerminalOutput('🤖 Regenerating code with AI...', 'info');
      
      const response = await apiService.post(`/projects/enhanced/${project._id}/regenerate`, {
        currentFiles: files,
        improvements: 'Enhance the existing code with better styling and functionality'
      });
      
      const newFiles = response.data.files || {};
      setFiles(newFiles);
      
      addTerminalOutput('✅ Code regenerated successfully!', 'success');
      toast.success('Code regenerated!');
      
    } catch (error) {
      console.error('Error regenerating code:', error);
      addTerminalOutput('❌ Regeneration failed: ' + error.message, 'error');
      toast.error('Failed to regenerate code');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FiCode className="w-4 h-4 text-yellow-500" />;
      case 'html':
        return <FiFileText className="w-4 h-4 text-orange-500" />;
      case 'css':
        return <FiFileText className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <FiSettings className="w-4 h-4 text-gray-500" />;
      default:
        return <FiFile className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderFileTree = () => {
    const fileEntries = Object.keys(files);
    const tree = {};
    
    fileEntries.forEach(filePath => {
      const parts = filePath.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = { type: 'file', path: filePath };
        } else {
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} };
          }
          current = current[part].children;
        }
      });
    });

    const renderTree = (node, path = '', level = 0) => {
      return Object.entries(node).map(([name, item]) => (
        <div key={path + name}>
          {item.type === 'folder' ? (
            <div>
              <button
                onClick={() => toggleFolder(path + name)}
                className={`flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
              >
                {expandedFolders.has(path + name) ? 
                  <FiChevronDown className="w-3 h-3" /> : 
                  <FiChevronRight className="w-3 h-3" />
                }
                <FiFolder className="w-4 h-4 text-blue-500" />
                <span>{name}</span>
              </button>
              {expandedFolders.has(path + name) && (
                <div>
                  {renderTree(item.children, path + name + '/', level + 1)}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveFile(item.path)}
              className={`flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm ${
                activeFile === item.path ? 'bg-blue-50 text-blue-700' : ''
              }`}
              style={{ paddingLeft: `${level * 16 + 24}px` }}
            >
              {getFileIcon(name)}
              <span>{name}</span>
            </button>
          )}
        </div>
      ));
    };

    return renderTree(tree);
  };

  const renderMenuBar = () => (
    <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center text-xs">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-3 py-1 hover:bg-gray-200 flex items-center gap-1"
        >
          <FiArrowLeft className="w-3 h-3" />
          Dashboard
        </button>
        
        <div className="border-l border-gray-300 h-4 mx-1"></div>
        
        {/* File Menu */}
        <div className="relative group">
          <button className="px-3 py-1 hover:bg-gray-200">File</button>
          <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 rounded-md py-1 hidden group-hover:block z-50 min-w-48">
            <button onClick={saveProject} className="block w-full text-left px-3 py-1 hover:bg-gray-100">
              Save Project
            </button>
            <button onClick={downloadProject} className="block w-full text-left px-3 py-1 hover:bg-gray-100">
              Download Project
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button onClick={publishProject} className="block w-full text-left px-3 py-1 hover:bg-gray-100">
              Publish Project
            </button>
          </div>
        </div>

        {/* Edit Menu */}
        <div className="relative group">
          <button className="px-3 py-1 hover:bg-gray-200">Edit</button>
          <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 rounded-md py-1 hidden group-hover:block z-50 min-w-48">
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100">Undo</button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100">Redo</button>
            <div className="border-t border-gray-200 my-1"></div>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100">Find</button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100">Replace</button>
          </div>
        </div>

        {/* View Menu */}
        <div className="relative group">
          <button className="px-3 py-1 hover:bg-gray-200">View</button>
          <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 rounded-md py-1 hidden group-hover:block z-50 min-w-48">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
            >
              Toggle Sidebar
            </button>
            <button 
              onClick={() => setShowTerminal(!showTerminal)}
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
            >
              Toggle Terminal
            </button>
            <button 
              onClick={() => setShowProblems(!showProblems)}
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
            >
              Toggle Problems
            </button>
          </div>
        </div>

        {/* Run Menu */}
        <div className="relative group">
          <button className="px-3 py-1 hover:bg-gray-200">Run</button>
          <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 rounded-md py-1 hidden group-hover:block z-50 min-w-48">
            <button onClick={runBuild} className="block w-full text-left px-3 py-1 hover:bg-gray-100">
              Build Project
            </button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100">
              Run Tests
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button onClick={regenerateWithAI} className="block w-full text-left px-3 py-1 hover:bg-gray-100">
              Regenerate with AI
            </button>
          </div>
        </div>

        {/* Terminal Menu */}
        <div className="relative group">
          <button className="px-3 py-1 hover:bg-gray-200">Terminal</button>
          <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 rounded-md py-1 hidden group-hover:block z-50 min-w-48">
            <button 
              onClick={() => setShowTerminal(true)}
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
            >
              New Terminal
            </button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100">
              Split Terminal
            </button>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 px-3">
        <span className="text-gray-600">{project.name}</span>
        {saving && <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
      </div>
    </div>
  );

  return (
    <div className={`h-screen flex flex-col bg-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Menu Bar */}
      {showMenuBar && renderMenuBar()}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Explorer</h3>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto p-2">
              {renderFileTree()}
            </div>

            {/* Sidebar Actions */}
            <div className="p-3 border-t border-gray-200 space-y-2">
              <button
                onClick={generateProjectCode}
                disabled={isGeneratingCode}
                className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {isGeneratingCode ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiZap className="w-4 h-4" />
                )}
                Generate Code
              </button>
              
              <button
                onClick={runBuild}
                disabled={building}
                className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {building ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiPlay className="w-4 h-4" />
                )}
                Build
              </button>
            </div>
          </div>
        )}

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col">
          {/* View Toggle */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedView('code')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedView === 'code' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FiCode className="w-4 h-4 inline mr-1" />
                Code
              </button>
              <button
                onClick={() => setSelectedView('split')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedView === 'split' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FiMaximize2 className="w-4 h-4 inline mr-1" />
                Split
              </button>
              <button
                onClick={() => setSelectedView('preview')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedView === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FiEye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveProject}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                <FiSave className="w-4 h-4" />
                Save
              </button>
              
              <button
                onClick={downloadProject}
                className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                <FiDownload className="w-4 h-4" />
                Download
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Editor/Preview Content */}
          <div className="flex-1 flex">
            {selectedView === 'code' && (
              <div className="flex-1 flex flex-col">
                {/* File Tabs */}
                <div className="flex items-center bg-gray-100 border-b border-gray-200 overflow-x-auto">
                  {Object.keys(files).map(filePath => (
                    <button
                      key={filePath}
                      onClick={() => setActiveFile(filePath)}
                      className={`px-4 py-2 text-sm border-r border-gray-200 whitespace-nowrap ${
                        activeFile === filePath
                          ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {filePath.split('/').pop()}
                    </button>
                  ))}
                </div>

                {/* Editor */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={files[activeFile]?.language || 'javascript'}
                    value={files[activeFile]?.content || ''}
                    onChange={(value) => {
                      setFiles(prev => ({
                        ...prev,
                        [activeFile]: {
                          ...prev[activeFile],
                          content: value
                        }
                      }));
                    }}
                    onMount={(editor, monaco) => {
                      editorRef.current = editor;
                    }}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      renderWhitespace: 'selection'
                    }}
                  />
                </div>
              </div>
            )}

            {selectedView === 'preview' && (
              <div className="flex-1 bg-white">
                <iframe
                  ref={previewRef}
                  srcDoc={previewContent}
                  className="w-full h-full border-0"
                  title="Preview"
                />
              </div>
            )}

            {selectedView === 'split' && (
              <Split
                sizes={[60, 40]}
                direction="horizontal"
                className="flex-1"
                split="vertical"
              >
                <div className="flex flex-col">
                  {/* File Tabs */}
                  <div className="flex items-center bg-gray-100 border-b border-gray-200 overflow-x-auto">
                    {Object.keys(files).map(filePath => (
                      <button
                        key={filePath}
                        onClick={() => setActiveFile(filePath)}
                        className={`px-4 py-2 text-sm border-r border-gray-200 whitespace-nowrap ${
                          activeFile === filePath
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {filePath.split('/').pop()}
                      </button>
                    ))}
                  </div>

                  {/* Editor */}
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={files[activeFile]?.language || 'javascript'}
                      value={files[activeFile]?.content || ''}
                      onChange={(value) => {
                        setFiles(prev => ({
                          ...prev,
                          [activeFile]: {
                            ...prev[activeFile],
                            content: value
                          }
                        }));
                      }}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-white border-l border-gray-200">
                  <div className="p-2 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-medium text-gray-900">Preview</h3>
                  </div>
                  <iframe
                    srcDoc={previewContent}
                    className="w-full h-full border-0"
                    title="Preview"
                  />
                </div>
              </Split>
            )}
          </div>

          {/* Bottom Panel */}
          {(showTerminal || showProblems) && (
            <div className="h-48 border-t border-gray-200 bg-gray-50">
              {/* Panel Tabs */}
              <div className="flex items-center border-b border-gray-200">
                <button
                  onClick={() => setShowTerminal(true)}
                  className={`px-4 py-2 text-sm ${
                    showTerminal ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <FiTerminal className="w-4 h-4 inline mr-1" />
                  Terminal
                </button>
                <button
                  onClick={() => setShowProblems(true)}
                  className={`px-4 py-2 text-sm ${
                    showProblems ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <FiBug className="w-4 h-4 inline mr-1" />
                  Problems ({problems.length})
                </button>
                
                <button
                  onClick={() => {
                    setShowTerminal(false);
                    setShowProblems(false);
                  }}
                  className="ml-auto p-2 hover:bg-gray-200 rounded"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-2">
                {showTerminal && (
                  <div className="font-mono text-sm space-y-1">
                    {terminalOutput.map((output, index) => (
                      <div
                        key={index}
                        className={`${
                          output.type === 'error' ? 'text-red-600' :
                          output.type === 'success' ? 'text-green-600' :
                          'text-gray-700'
                        }`}
                      >
                        <span className="text-gray-500">[{output.timestamp}]</span> {output.message}
                      </div>
                    ))}
                  </div>
                )}
                
                {showProblems && (
                  <div className="space-y-2">
                    {problems.length === 0 ? (
                      <div className="text-gray-500 text-sm">No problems found</div>
                    ) : (
                      problems.map((problem, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                          <FiBug className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-red-900">{problem.message}</div>
                            <div className="text-xs text-red-600">{problem.file}:{problem.line}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCodeEditor;

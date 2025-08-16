// src/pages/EnhancedBuilderPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   FiCode, FiTerminal, FiFolder, FiFile, FiSave, FiPlay,
//   FiSettings, FiSearch, FiHome, FiDownload, FiUpload, FiRefreshCw,
//   FiMaximize2, FiMinimize2, FiMoreHorizontal, FiX, FiPlus,
//   FiChevronRight, FiChevronDown, FiEdit3, FiTrash2, FiCopy,
//   FiZap, FiDatabase, FiEye, FiLayout, FiCommand
// } from 'react-icons/fi';
import io from 'socket.io-client';

// Import services
import { apiService } from '../services/api';

// Import components
import AICodeGenerator from '../components/Builder/AICodeGenerator';
import EnhancedCodeEditor from '../components/Builder/EnhancedCodeEditor_new';
import TerminalPanel from '../components/Builder/TerminalPanel';
import FileExplorer from '../components/Builder/FileExplorer';
import MenuBar from '../components/Builder/MenuBar';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const EnhancedBuilderPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Core state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // AI Core Components State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState({ stats: null, results: [] });
  const [activeFiles, setActiveFiles] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  
  // UI State
  const [layout, setLayout] = useState({
    showSidebar: true,
    showTerminal: false,
    showAiPanel: true,
    sidebarWidth: 250,
    terminalHeight: 200,
    currentView: 'split' // 'code', 'preview', 'split'
  });
  
  // File System State
  const [fileTree, setFileTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'public']));
  
  // Terminal State
  const [terminals, setTerminals] = useState([]);
  const [activeTerminal, setActiveTerminal] = useState(null);
  
  // WebSocket connection
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // AI Generation State
  const [generationStatus, setGenerationStatus] = useState({
    stage: 'idle',
    message: '',
    progress: 0,
    files: {},
    streaming: false
  });

  // Refs
  const editorRef = useRef(null);
  const terminalRef = useRef(null);

  // Initialize component
  useEffect(() => {
    initializeBuilder();
    return () => cleanup();
  }, [projectId]);

  // Initialize builder with project data and WebSocket
  const initializeBuilder = async () => {
    try {
      setLoading(true);
      
      // Fetch project data
      await fetchProject();
      
      // Initialize WebSocket connection
      await initializeWebSocket();
      
      // Load knowledge base stats
      await loadKnowledgeBase();
      
      // Load file tree
      await loadFileTree();
      
    } catch (error) {
      console.error('Builder initialization error:', error);
      toast.error('Failed to initialize builder');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // 1. USER AND PROJECT DATA MANAGEMENT
  const fetchProject = async () => {
    try {
      const response = await apiService.get(`/projects/enhanced/${projectId}/details`);
      const projectData = response.data.project;
      
      setProject(projectData);
      
      // Initialize files if project has content
      if (projectData.content) {
        setActiveFiles(projectData.content);
        
        // Set first file as current
        const fileKeys = Object.keys(projectData.content);
        if (fileKeys.length > 0) {
          setCurrentFile(fileKeys[0]);
        }
      }
      
      return projectData;
    } catch (error) {
      throw new Error('Failed to load project: ' + error.message);
    }
  };

  // 2. AI KNOWLEDGE BASE AND LEARNING LOOP
  const loadKnowledgeBase = async () => {
    try {
      const response = await apiService.get('/projects/enhanced/knowledge/stats');
      setKnowledgeBase(prev => ({
        ...prev,
        stats: response.data.stats
      }));
    } catch (error) {
      console.error('Failed to load knowledge base stats:', error);
    }
  };

  const searchKnowledgeBase = async (query, filters = {}) => {
    try {
      setKnowledgeBase(prev => ({
        ...prev,
        searching: true
      }));
      
      // This would call a knowledge search endpoint
      const response = await apiService.post('/projects/enhanced/knowledge/search', {
        query,
        filters: {
          ...filters,
          stack: project?.frontendTech || 'react',
          category: project?.category
        }
      });
      
      setKnowledgeBase(prev => ({
        ...prev,
        results: response.data.results,
        searching: false
      }));
      
      return response.data.results;
    } catch (error) {
      console.error('Knowledge base search failed:', error);
      setKnowledgeBase(prev => ({ ...prev, searching: false }));
      return [];
    }
  };

  // 3. AI CODE GENERATION ENGINE
  const generateAICode = async (request) => {
    try {
      setAiGenerating(true);
      setGenerationStatus({
        stage: 'starting',
        message: 'Initializing AI code generation...',
        progress: 0,
        files: {},
        streaming: true
      });

      // Use WebSocket for live generation
      if (socket && connected) {
        socket.emit('code:generate', {
          type: request.type || 'full-project',
          description: request.description,
          component: request.component,
          options: request.options || {}
        });
      } else {
        // Fallback to REST API
        const response = await apiService.post(`/projects/enhanced/${projectId}/generate-live-code`, request);
        
        if (response.data.files) {
          setActiveFiles(prev => ({
            ...prev,
            ...response.data.files
          }));
          
          // Set first generated file as current
          const fileKeys = Object.keys(response.data.files);
          if (fileKeys.length > 0 && !currentFile) {
            setCurrentFile(fileKeys[0]);
          }
        }
        
        setGenerationStatus({
          stage: 'completed',
          message: 'Code generation completed!',
          progress: 100,
          files: response.data.files,
          streaming: false
        });
      }

    } catch (error) {
      console.error('AI code generation failed:', error);
      toast.error('Code generation failed: ' + error.message);
      setGenerationStatus({
        stage: 'error',
        message: 'Generation failed: ' + error.message,
        progress: 0,
        files: {},
        streaming: false
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // 4. TWO-PRONGED INPUT PROCESSOR
  const processUserInput = async (userInput, aiContext = {}) => {
    try {
      // Combine user instructions with AI context
      const processedRequest = {
        userInstructions: userInput.description || userInput,
        aiContext: {
          knowledgeBase: knowledgeBase.results.slice(0, 3), // Top 3 matches
          projectContext: {
            name: project?.name,
            description: project?.description,
            category: project?.category,
            stack: project?.frontendTech || 'react',
            backendRequired: project?.backendRequired
          },
          ...aiContext
        },
        processingMode: 'enhanced' // Use enhanced processing with both inputs
      };

      // Generate enhanced prompt combining both user and AI inputs
      const enhancedRequest = {
        type: userInput.type || 'component',
        description: `
User Requirements: ${processedRequest.userInstructions}

AI Context: 
- Project: ${processedRequest.aiContext.projectContext.name}
- Category: ${processedRequest.aiContext.projectContext.category}
- Stack: ${processedRequest.aiContext.projectContext.stack}
${processedRequest.aiContext.knowledgeBase.length > 0 ? 
  `- Similar code patterns found: ${processedRequest.aiContext.knowledgeBase.length}` : 
  '- No similar patterns found, generating fresh code'
}

Generate code that combines the user requirements with best practices from the AI context.
`,
        component: userInput.component,
        options: userInput.options
      };

      return await generateAICode(enhancedRequest);
    } catch (error) {
      console.error('Input processing failed:', error);
      throw error;
    }
  };

  // 5. CODE ASSEMBLY AND CONNECTION
  const assembleProjectStructure = async (generatedFiles) => {
    try {
      setGenerationStatus(prev => ({
        ...prev,
        stage: 'assembling',
        message: 'Assembling project structure...'
      }));

      // Analyze dependencies and install them
      const dependencies = extractDependencies(generatedFiles);
      if (dependencies.length > 0) {
        await installDependencies(dependencies);
      }

      // Set up proper file linking and imports
      const assembledFiles = await linkFiles(generatedFiles);
      
      // Initialize workspace with assembled files
      await apiService.post(`/projects/enhanced/${projectId}/workspace/init`, {
        files: assembledFiles
      });

      setActiveFiles(assembledFiles);
      
      // Update file tree
      await loadFileTree();
      
      return assembledFiles;
    } catch (error) {
      console.error('Project assembly failed:', error);
      throw error;
    }
  };

  const extractDependencies = (files) => {
    const dependencies = new Set();
    
    for (const [filePath, fileData] of Object.entries(files)) {
      if (filePath.includes('package.json')) {
        try {
          const packageData = JSON.parse(fileData.content);
          if (packageData.dependencies) {
            Object.keys(packageData.dependencies).forEach(dep => dependencies.add(dep));
          }
        } catch (e) {
          console.warn('Failed to parse package.json:', e);
        }
      }
      
      // Extract import statements for auto-dependency detection
      const importMatches = fileData.content.match(/import .+ from ['"]([^'"]+)['"]/g);
      if (importMatches) {
        importMatches.forEach(importLine => {
          const match = importLine.match(/from ['"]([^'"]+)['"]/);
          if (match && !match[1].startsWith('.') && !match[1].startsWith('/')) {
            dependencies.add(match[1]);
          }
        });
      }
    }
    
    return Array.from(dependencies);
  };

  const linkFiles = async (files) => {
    // This would implement intelligent file linking
    // For now, return files as-is but could add:
    // - Automatic import/export linking
    // - Route configuration
    // - Component registration
    return files;
  };

  const installDependencies = async (dependencies) => {
    try {
      const response = await apiService.post(`/projects/enhanced/${projectId}/packages/install`, {
        packages: dependencies
      });
      
      if (response.data.terminalId) {
        // Monitor installation in terminal
        setTerminals(prev => [...prev, {
          id: response.data.terminalId,
          title: 'Package Installation',
          active: true
        }]);
      }
    } catch (error) {
      console.warn('Dependency installation failed:', error);
    }
  };

  // 6. REDESIGN AND ITERATION LOOP
  const testAndIterate = async () => {
    try {
      setGenerationStatus(prev => ({
        ...prev,
        stage: 'testing',
        message: 'Testing generated code...'
      }));

      // Run build to test code
      const buildResponse = await apiService.post(`/projects/enhanced/${projectId}/build`);
      
      if (buildResponse.data.terminalId) {
        setTerminals(prev => [...prev, {
          id: buildResponse.data.terminalId,
          title: 'Build Test',
          active: true
        }]);
        
        // Monitor build output for errors
        setTimeout(() => {
          checkBuildResults(buildResponse.data.terminalId);
        }, 5000);
      }
      
    } catch (error) {
      console.error('Testing failed:', error);
      toast.error('Code testing failed');
    }
  };

  const checkBuildResults = async (terminalId) => {
    try {
      const response = await apiService.get(`/projects/enhanced/terminal/${terminalId}/output`);
      const output = response.data.output || [];
      
      // Analyze output for errors
      const errors = output.filter(line => 
        line.type === 'stderr' || 
        line.content.toLowerCase().includes('error') ||
        line.content.toLowerCase().includes('failed')
      );
      
      if (errors.length > 0) {
        // Auto-fix detected errors
        await autoFixErrors(errors);
      } else {
        setGenerationStatus(prev => ({
          ...prev,
          stage: 'completed',
          message: 'Code generated and tested successfully!'
        }));
        toast.success('Code generation completed successfully!');
      }
    } catch (error) {
      console.error('Build result check failed:', error);
    }
  };

  const autoFixErrors = async (errors) => {
    try {
      setGenerationStatus(prev => ({
        ...prev,
        stage: 'fixing',
        message: 'Auto-fixing detected errors...'
      }));

      // Prepare error context for AI
      const errorContext = errors.map(error => error.content).join('\n');
      
      // Request AI to fix the errors
      const fixRequest = {
        type: 'error-fix',
        description: `Fix the following errors in the generated code:\n\n${errorContext}`,
        context: {
          files: activeFiles,
          errors: errors
        }
      };

      await generateAICode(fixRequest);
      
      // Re-test after fixes
      setTimeout(() => {
        testAndIterate();
      }, 3000);
      
    } catch (error) {
      console.error('Auto-fix failed:', error);
      toast.error('Auto-fix failed. Please review errors manually.');
    }
  };

  // WEBSOCKET INTEGRATION
  const initializeWebSocket = async () => {
    try {
      const socketConnection = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      socketConnection.on('connect', () => {
        // console.log('WebSocket connected');
        setConnected(true);
        
        // Authenticate with project
        socketConnection.emit('authenticate', {
          userId: 'current-user-id', // This should come from auth context
          projectId: projectId
        });
      });

      socketConnection.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      });

      // AI Code Generation Events
      socketConnection.on('code:generation:started', (data) => {
        setGenerationStatus({
          stage: 'started',
          message: 'AI code generation started...',
          progress: 10,
          files: {},
          streaming: true
        });
      });

      socketConnection.on('code:generation:status', (data) => {
        setGenerationStatus(prev => ({
          ...prev,
          stage: data.stage,
          message: data.message,
          progress: prev.progress + 10
        }));
      });

      socketConnection.on('code:generation:knowledge', (data) => {
        setKnowledgeBase(prev => ({
          ...prev,
          currentMatches: data.matches,
          topMatch: data.topMatch
        }));
        
        setGenerationStatus(prev => ({
          ...prev,
          message: `Found ${data.matches} similar code patterns in knowledge base`,
          progress: 30
        }));
      });

      socketConnection.on('code:file:started', (data) => {
        setGenerationStatus(prev => ({
          ...prev,
          message: `Generating ${data.filePath}...`,
          currentFile: data.filePath,
          progress: 40
        }));
      });

      socketConnection.on('code:file:chunk', (data) => {
        setActiveFiles(prev => {
          const currentContent = prev[data.filePath]?.content || '';
          return {
            ...prev,
            [data.filePath]: {
              content: currentContent + data.chunk,
              language: prev[data.filePath]?.language || 'javascript'
            }
          };
        });
        
        // Update current file if this is the active one
        if (data.filePath === currentFile || !currentFile) {
          setCurrentFile(data.filePath);
        }
      });

      socketConnection.on('code:file:completed', (data) => {
        setActiveFiles(prev => ({
          ...prev,
          [data.filePath]: {
            content: data.content,
            language: data.language
          }
        }));
      });

      socketConnection.on('code:generation:completed', (data) => {
        setGenerationStatus({
          stage: 'completed',
          message: `Code generation completed! Used ${data.metadata.provider} (${data.metadata.tokensUsed} tokens)`,
          progress: 100,
          files: data.files,
          streaming: false
        });
        
        setActiveFiles(prev => ({
          ...prev,
          ...data.files
        }));
        
        // Auto-test the generated code
        setTimeout(() => {
          testAndIterate();
        }, 1000);
        
        toast.success('AI code generation completed!');
      });

      socketConnection.on('code:generation:error', (data) => {
        setGenerationStatus({
          stage: 'error',
          message: `Generation failed: ${data.message}`,
          progress: 0,
          files: {},
          streaming: false
        });
        toast.error('Code generation failed');
      });

      // Terminal Events
      socketConnection.on('terminal:output', (data) => {
        // Handle real-time terminal output
        if (terminalRef.current) {
          terminalRef.current.appendOutput(data);
        }
      });

      setSocket(socketConnection);
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  };

  // FILE SYSTEM OPERATIONS
  const loadFileTree = async () => {
    try {
      const response = await apiService.get(`/projects/enhanced/${projectId}/workspace/tree`);
      setFileTree(response.data.tree || []);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    }
  };

  const openFile = async (filePath) => {
    try {
      if (activeFiles[filePath]) {
        setCurrentFile(filePath);
        return;
      }

      const response = await apiService.get(`/projects/enhanced/${projectId}/workspace/file`, {
        params: { filePath }
      });
      
      setActiveFiles(prev => ({
        ...prev,
        [filePath]: response.data.file
      }));
      
      setCurrentFile(filePath);
    } catch (error) {
      console.error('Failed to open file:', error);
      toast.error('Failed to open file');
    }
  };

  const saveFile = async (filePath, content) => {
    try {
      setSaving(true);
      
      // Save file using existing API
      const response = await apiService.post(`/enhanced-projects/${projectId}/workspace/file`, {
        filePath,
        content
      });
      
      // Update local state
      setActiveFiles(prev => ({
        ...prev,
        [filePath]: {
          ...prev[filePath],
          content
        }
      }));
      
      toast.success('File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
      toast.error('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const createFile = async (filePath) => {
    try {
      await apiService.post(`/projects/enhanced/${projectId}/workspace/file`, {
        filePath,
        content: ''
      });
      
      setActiveFiles(prev => ({
        ...prev,
        [filePath]: { content: '', language: 'javascript' }
      }));
      
      await loadFileTree();
      setCurrentFile(filePath);
      toast.success('File created');
    } catch (error) {
      console.error('Failed to create file:', error);
      toast.error('Failed to create file');
    }
  };

  const deleteFile = async (filePath) => {
    try {
      await apiService.delete(`/projects/enhanced/${projectId}/workspace/file`, {
        data: { filePath }
      });
      
      setActiveFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[filePath];
        return newFiles;
      });
      
      if (currentFile === filePath) {
        const remainingFiles = Object.keys(activeFiles).filter(f => f !== filePath);
        setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
      }
      
      await loadFileTree();
      toast.success('File deleted');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  // TERMINAL OPERATIONS
  const createTerminal = async (initialPath = null) => {
    try {
      if (socket && connected) {
        socket.emit('terminal:create', { initialPath });
      } else {
        const response = await apiService.post(`/projects/enhanced/${projectId}/terminal/create`, {
          initialPath
        });
        
        if (response.data.terminal) {
          setTerminals(prev => [...prev, {
            id: response.data.terminal.terminalId,
            title: 'Terminal',
            active: true
          }]);
          setActiveTerminal(response.data.terminal.terminalId);
        }
      }
      
      setLayout(prev => ({ ...prev, showTerminal: true }));
    } catch (error) {
      console.error('Failed to create terminal:', error);
      toast.error('Failed to create terminal');
    }
  };

  // MENU BAR ACTIONS
  const menuActions = {
    // File menu
    newFile: () => {
      const fileName = prompt('Enter file name:');
      if (fileName) createFile(fileName);
    },
    newFolder: async () => {
      const folderName = prompt('Enter folder name:');
      if (folderName) {
        try {
          await apiService.post(`/projects/enhanced/${projectId}/workspace/directory`, {
            dirPath: folderName
          });
          await loadFileTree();
          toast.success('Folder created');
        } catch (error) {
          toast.error('Failed to create folder');
        }
      }
    },
    save: () => {
      if (currentFile && activeFiles[currentFile]) {
        saveFile(currentFile, activeFiles[currentFile].content);
      }
    },
    saveAll: async () => {
      try {
        setSaving(true);
        
        // Save all files individually
        for (const [filePath, fileData] of Object.entries(activeFiles)) {
          await apiService.post(`/enhanced-projects/${projectId}/workspace/file`, {
            filePath,
            content: fileData.content
          });
        }
        
        toast.success('All files saved');
      } catch (error) {
        toast.error('Failed to save all files');
      } finally {
        setSaving(false);
      }
    },
    
    // View menu
    toggleSidebar: () => setLayout(prev => ({ ...prev, showSidebar: !prev.showSidebar })),
    toggleTerminal: () => setLayout(prev => ({ ...prev, showTerminal: !prev.showTerminal })),
    toggleAiPanel: () => setLayout(prev => ({ ...prev, showAiPanel: !prev.showAiPanel })),
    
    // Terminal menu
    newTerminal: () => createTerminal(),
    splitTerminal: () => createTerminal(),
    
    // Run menu
    runBuild: async () => {
      try {
        const response = await apiService.post(`/projects/enhanced/${projectId}/build`);
        if (response.data.terminalId) {
          setTerminals(prev => [...prev, {
            id: response.data.terminalId,
            title: 'Build',
            active: true
          }]);
          setLayout(prev => ({ ...prev, showTerminal: true }));
        }
      } catch (error) {
        toast.error('Failed to start build');
      }
    },
    runDev: async () => {
      try {
        const response = await apiService.post(`/projects/enhanced/${projectId}/dev`);
        if (response.data.terminalId) {
          setTerminals(prev => [...prev, {
            id: response.data.terminalId,
            title: 'Dev Server',
            active: true
          }]);
          setLayout(prev => ({ ...prev, showTerminal: true }));
        }
      } catch (error) {
        toast.error('Failed to start dev server');
      }
    },
    
    // Preview menu
    previewProject: async () => {
      try {
        // Generate preview using existing API
        const response = await apiService.post(`/enhanced-projects/${projectId}/build`);
        
        if (response.data.previewUrl) {
          window.open(response.data.previewUrl, '_blank');
          toast.success('Preview opened in new tab');
        } else {
          toast.error('Failed to generate preview');
        }
      } catch (error) {
        console.error('Preview failed:', error);
        toast.error('Failed to open preview');
      }
    },
    
    openLivePreview: async () => {
      try {
        // Start dev server for live preview
        const response = await apiService.post(`/enhanced-projects/${projectId}/dev`);
        
        if (response.data.devUrl) {
          window.open(response.data.devUrl, '_blank');
          toast.success('Live preview started');
        }
      } catch (error) {
        console.error('Live preview failed:', error);
        toast.error('Failed to start live preview');
      }
    }
  };

  // CLEANUP
  const cleanup = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-gray-400 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Menu Bar */}
      <MenuBar 
        project={project}
        actions={menuActions}
        saving={saving}
        connected={connected}
        onNavigate={() => navigate('/dashboard')}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {layout.showSidebar && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: layout.sidebarWidth }}
              exit={{ width: 0 }}
              className="bg-gray-800 border-r border-gray-700 flex flex-col"
            >
              <FileExplorer
                fileTree={fileTree}
                activeFiles={activeFiles}
                currentFile={currentFile}
                expandedFolders={expandedFolders}
                onFileSelect={openFile}
                onFileCreate={createFile}
                onFileDelete={deleteFile}
                onFolderToggle={(folder) => {
                  setExpandedFolders(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(folder)) {
                      newSet.delete(folder);
                    } else {
                      newSet.add(folder);
                    }
                    return newSet;
                  });
                }}
                onRefresh={loadFileTree}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <EnhancedCodeEditor
                ref={editorRef}
                project={project}
                onProjectChange={(updatedProject) => {
                  setProject(updatedProject);
                  // Also update activeFiles if needed
                  if (updatedProject.content) {
                    setActiveFiles(updatedProject.content);
                  }
                }}
              />
            </div>
            
            {/* AI Panel */}
            <AnimatePresence>
              {layout.showAiPanel && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 350 }}
                  exit={{ width: 0 }}
                  className="bg-gray-800 border-l border-gray-700"
                >
                  <AICodeGenerator
                    project={project}
                    knowledgeBase={knowledgeBase}
                    generationStatus={generationStatus}
                    onGenerate={processUserInput}
                    onSearch={searchKnowledgeBase}
                    aiGenerating={aiGenerating}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Terminal */}
          <AnimatePresence>
            {layout.showTerminal && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: layout.terminalHeight }}
                exit={{ height: 0 }}
                className="bg-black border-t border-gray-700"
              >
                <TerminalPanel
                  ref={terminalRef}
                  terminals={terminals}
                  activeTerminal={activeTerminal}
                  socket={socket}
                  projectId={projectId}
                  onTerminalCreate={createTerminal}
                  onTerminalSelect={setActiveTerminal}
                  onTerminalClose={(terminalId) => {
                    setTerminals(prev => prev.filter(t => t.id !== terminalId));
                    if (activeTerminal === terminalId) {
                      setActiveTerminal(null);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-blue-600 flex items-center justify-between px-4 text-xs">
        <div className="flex items-center space-x-4">
          <span>{project.name}</span>
          <span className="text-blue-200">
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {saving && <span className="text-blue-200">💾 Saving...</span>}
        </div>
        <div className="flex items-center space-x-4">
          {knowledgeBase.stats && (
            <span className="text-blue-200">
              🧠 KB: {knowledgeBase.stats.totalEntries} entries
            </span>
          )}
          <span className="text-blue-200">
            {layout.currentView.charAt(0).toUpperCase() + layout.currentView.slice(1)} View
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBuilderPage;

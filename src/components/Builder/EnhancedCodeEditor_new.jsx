// src/components/Builder/EnhancedCodeEditor.jsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { FiCode, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Editor from '@monaco-editor/react';

const EnhancedCodeEditor = forwardRef(({ project, onProjectChange }, ref) => {
  const [activeFile, setActiveFile] = useState('index.html');
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);

  const editorRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    saveCurrentFile: () => saveFile(),
    getCurrentFile: () => activeFile,
    getFiles: () => files,
    setActiveFile: (filePath) => setActiveFile(filePath),
    refreshPreview: () => console.log('Preview refreshed'),
    getEditorInstance: () => editorRef.current
  }));

  useEffect(() => {
    if (project?.content) {
      setFiles(project.content);
      // Set first file as active
      const fileKeys = Object.keys(project.content);
      if (fileKeys.length > 0) {
        setActiveFile(fileKeys[0]);
      }
    }
  }, [project]);

  const saveFile = async () => {
    if (!project || !activeFile) return;
    
    try {
      setSaving(true);
      
      // Get current content from editor
      const currentContent = files[activeFile] || '';
      
      // Call the parent's save function which handles both database and file system
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          [activeFile]: currentContent
        }
      };
      
      if (onProjectChange) {
        onProjectChange(updatedProject);
      }
      
      toast.success('File saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const onFileChange = (content) => {
    if (!activeFile) return;
    
    setFiles(prev => ({
      ...prev,
      [activeFile]: content
    }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <FiCode className="w-4 h-4" />
          <span className="text-sm font-medium">Code Editor</span>
          {activeFile && <span className="text-xs text-gray-400">({activeFile})</span>}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={saveFile}
            disabled={saving}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-xs"
          >
            <FiSave className="w-3 h-3" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1">
        <Editor
          ref={editorRef}
          height="100%"
          theme="vs-dark"
          language="html"
          value={files[activeFile] || ''}
          onChange={onFileChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true
          }}
        />
      </div>
    </div>
  );
});

EnhancedCodeEditor.displayName = 'EnhancedCodeEditor';

export default EnhancedCodeEditor;

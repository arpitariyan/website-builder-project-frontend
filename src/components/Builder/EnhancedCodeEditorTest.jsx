import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const EnhancedCodeEditorTest = () => {
  const [activeFile, setActiveFile] = useState('index.html');
  const [files, setFiles] = useState({
    'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>Test</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>',
    'style.css': 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}',
    'script.js': 'console.log("Hello World");'
  });

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="flex-1 flex">
        {/* File Tree */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h3 className="text-sm font-medium mb-3">Files</h3>
          <div className="space-y-1">
            {Object.keys(files).map((fileName) => (
              <div
                key={fileName}
                className={`p-2 rounded cursor-pointer text-sm ${
                  activeFile === fileName 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveFile(fileName)}
              >
                {fileName}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <span className="text-sm">{activeFile}</span>
          </div>
          <div className="flex-1 p-4">
            <textarea
              className="w-full h-full bg-gray-900 text-white font-mono text-sm resize-none border-none outline-none"
              value={files[activeFile]}
              onChange={(e) => setFiles({ ...files, [activeFile]: e.target.value })}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="w-96 bg-white border-l border-gray-700">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <span className="text-sm text-white">Preview</span>
          </div>
          <div className="h-full">
            <iframe
              srcDoc={files['index.html']}
              className="w-full h-full border-none"
              title="Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCodeEditorTest;

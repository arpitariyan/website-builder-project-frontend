// src/components/Builder/FileExplorer.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFolder, FiFolderPlus, FiFile, FiFilePlus, FiTrash2,
  FiEdit3, FiCopy, FiRefreshCw, FiChevronRight, FiChevronDown,
  FiCode, FiImage, FiFileText, FiPackage, FiSettings
} from 'react-icons/fi';

const FileExplorer = ({
  fileTree,
  activeFiles,
  currentFile,
  expandedFolders,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFolderToggle,
  onRefresh
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemDialog, setNewItemDialog] = useState(null);
  const [newItemName, setNewItemName] = useState('');

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconProps = { className: "w-4 h-4" };
    
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FiCode {...iconProps} className="w-4 h-4 text-yellow-400" />;
      case 'json':
        return <FiPackage {...iconProps} className="w-4 h-4 text-green-400" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <FiFileText {...iconProps} className="w-4 h-4 text-blue-400" />;
      case 'html':
        return <FiCode {...iconProps} className="w-4 h-4 text-orange-400" />;
      case 'md':
        return <FiFileText {...iconProps} className="w-4 h-4 text-purple-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FiImage {...iconProps} className="w-4 h-4 text-pink-400" />;
      default:
        return <FiFile {...iconProps} className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleContextMenu = (e, item, itemType) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      itemType
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleNewItem = (type, parentPath = '') => {
    setNewItemDialog({ type, parentPath });
    setNewItemName('');
    closeContextMenu();
  };

  const createNewItem = () => {
    if (!newItemName.trim()) return;
    
    const fullPath = newItemDialog.parentPath 
      ? `${newItemDialog.parentPath}/${newItemName}`
      : newItemName;
    
    if (newItemDialog.type === 'file') {
      onFileCreate(fullPath);
    } else {
      // Handle folder creation
      console.log('Create folder:', fullPath);
    }
    
    setNewItemDialog(null);
    setNewItemName('');
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      onFileDelete(item.path);
    }
    closeContextMenu();
  };

  const renderFileTreeItem = (item, depth = 0) => {
    const isFolder = item.type === 'directory';
    const isExpanded = expandedFolders.has(item.path);
    const isActive = currentFile === item.path;
    const hasActiveFile = currentFile && currentFile.startsWith(item.path + '/');

    return (
      <div key={item.path}>
        <motion.div
          className={`flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-gray-700 transition-colors ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
          } ${hasActiveFile && isFolder ? 'text-blue-400' : ''}`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (isFolder) {
              onFolderToggle(item.path);
            } else {
              onFileSelect(item.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, item, item.type)}
          whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
        >
          {isFolder && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="mr-1"
            >
              <FiChevronRight className="w-3 h-3" />
            </motion.div>
          )}
          
          {isFolder ? (
            <FiFolder className={`w-4 h-4 mr-2 ${
              isExpanded ? 'text-blue-400' : 'text-gray-500'
            }`} />
          ) : (
            <div className="mr-2">{getFileIcon(item.name)}</div>
          )}
          
          <span className="flex-1 truncate">{item.name}</span>
          
          {activeFiles[item.path] && !isFolder && (
            <div className="w-2 h-2 bg-blue-400 rounded-full ml-2" />
          )}
        </motion.div>

        <AnimatePresence>
          {isFolder && isExpanded && item.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {item.children.map(child => renderFileTreeItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Explorer</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleNewItem('file')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="New File"
              >
                <FiFilePlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleNewItem('folder')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="New Folder"
              >
                <FiFolderPlus className="w-4 h-4" />
              </button>
              <button
                onClick={onRefresh}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto">
          {fileTree.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <FiFolder className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No files found</p>
              <button
                onClick={() => handleNewItem('file')}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Create your first file
              </button>
            </div>
          ) : (
            <div className="py-2">
              {fileTree.map(item => renderFileTreeItem(item))}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={closeContextMenu}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-[160px]"
              style={{
                left: contextMenu.x,
                top: contextMenu.y
              }}
            >
              {contextMenu.itemType === 'directory' ? (
                <>
                  <button
                    onClick={() => handleNewItem('file', contextMenu.item.path)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FiFilePlus className="w-4 h-4" />
                    <span>New File</span>
                  </button>
                  <button
                    onClick={() => handleNewItem('folder', contextMenu.item.path)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FiFolderPlus className="w-4 h-4" />
                    <span>New Folder</span>
                  </button>
                  <div className="border-t border-gray-600 my-1" />
                  <button
                    onClick={() => handleDelete(contextMenu.item)}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onFileSelect(contextMenu.item.path);
                      closeContextMenu();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={() => {
                      // Copy file path to clipboard
                      navigator.clipboard.writeText(contextMenu.item.path);
                      closeContextMenu();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FiCopy className="w-4 h-4" />
                    <span>Copy Path</span>
                  </button>
                  <div className="border-t border-gray-600 my-1" />
                  <button
                    onClick={() => handleDelete(contextMenu.item)}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Item Dialog */}
      <AnimatePresence>
        {newItemDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Create New {newItemDialog.type === 'file' ? 'File' : 'Folder'}
              </h3>
              
              {newItemDialog.parentPath && (
                <p className="text-sm text-gray-400 mb-3">
                  in: {newItemDialog.parentPath}
                </p>
              )}
              
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`${newItemDialog.type === 'file' ? 'filename.js' : 'folder-name'}`}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    createNewItem();
                  } else if (e.key === 'Escape') {
                    setNewItemDialog(null);
                  }
                }}
              />
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setNewItemDialog(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewItem}
                  disabled={!newItemName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FileExplorer;

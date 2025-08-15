// src/components/Builder/MenuBar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFile, FiEdit, FiEye, FiCommand, FiTerminal, FiPlay,
  FiSettings, FiHome, FiSave, FiFolder, FiSearch, FiCopy,
  FiClipboard, FiRotateCcw, FiRotateCw, FiChevronDown, FiWifi, FiWifiOff
} from 'react-icons/fi';

const MenuBar = ({ 
  project, 
  actions, 
  saving, 
  connected, 
  onNavigate 
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const menuItems = [
    {
      label: 'File',
      key: 'file',
      items: [
        { label: 'New File', action: actions.newFile, shortcut: 'Ctrl+N', icon: FiFile },
        { label: 'New Folder', action: actions.newFolder, shortcut: 'Ctrl+Shift+N', icon: FiFolder },
        { type: 'separator' },
        { label: 'Save', action: actions.save, shortcut: 'Ctrl+S', icon: FiSave },
        { label: 'Save All', action: actions.saveAll, shortcut: 'Ctrl+K S', icon: FiSave },
        { type: 'separator' },
        { label: 'Close', action: () => onNavigate(), shortcut: 'Ctrl+W' }
      ]
    },
    {
      label: 'Edit',
      key: 'edit',
      items: [
        { label: 'Undo', action: () => {}, shortcut: 'Ctrl+Z', icon: FiRotateCcw },
        { label: 'Redo', action: () => {}, shortcut: 'Ctrl+Y', icon: FiRotateCw },
        { type: 'separator' },
        { label: 'Cut', action: () => {}, shortcut: 'Ctrl+X' },
        { label: 'Copy', action: () => {}, shortcut: 'Ctrl+C', icon: FiCopy },
        { label: 'Paste', action: () => {}, shortcut: 'Ctrl+V', icon: FiClipboard },
        { type: 'separator' },
        { label: 'Find', action: () => {}, shortcut: 'Ctrl+F', icon: FiSearch },
        { label: 'Replace', action: () => {}, shortcut: 'Ctrl+H' },
        { label: 'Find in Files', action: () => {}, shortcut: 'Ctrl+Shift+F' }
      ]
    },
    {
      label: 'View',
      key: 'view',
      items: [
        { label: 'Toggle Sidebar', action: actions.toggleSidebar, shortcut: 'Ctrl+B' },
        { label: 'Toggle Terminal', action: actions.toggleTerminal, shortcut: 'Ctrl+`' },
        { label: 'Toggle AI Panel', action: actions.toggleAiPanel, shortcut: 'Ctrl+Shift+A' },
        { type: 'separator' },
        { label: 'Explorer', action: () => {}, shortcut: 'Ctrl+Shift+E' },
        { label: 'Search', action: () => {}, shortcut: 'Ctrl+Shift+F' },
        { label: 'Problems', action: () => {}, shortcut: 'Ctrl+Shift+M' },
        { label: 'Output', action: () => {}, shortcut: 'Ctrl+Shift+U' }
      ]
    },
    {
      label: 'Go',
      key: 'go',
      items: [
        { label: 'Go to File...', action: () => {}, shortcut: 'Ctrl+P' },
        { label: 'Go to Symbol...', action: () => {}, shortcut: 'Ctrl+Shift+O' },
        { label: 'Go to Line...', action: () => {}, shortcut: 'Ctrl+G' },
        { type: 'separator' },
        { label: 'Back', action: () => {}, shortcut: 'Alt+Left' },
        { label: 'Forward', action: () => {}, shortcut: 'Alt+Right' }
      ]
    },
    {
      label: 'Run',
      key: 'run',
      items: [
        { label: 'Start Debugging', action: () => {}, shortcut: 'F5', icon: FiPlay },
        { label: 'Run Without Debugging', action: actions.runDev, shortcut: 'Ctrl+F5', icon: FiPlay },
        { label: 'Stop', action: () => {}, shortcut: 'Shift+F5' },
        { label: 'Restart', action: () => {}, shortcut: 'Ctrl+Shift+F5' },
        { type: 'separator' },
        { label: 'Build', action: actions.runBuild, shortcut: 'Ctrl+Shift+B' },
        { label: 'Clean', action: () => {} }
      ]
    },
    {
      label: 'Terminal',
      key: 'terminal',
      items: [
        { label: 'New Terminal', action: actions.newTerminal, shortcut: 'Ctrl+Shift+`', icon: FiTerminal },
        { label: 'Split Terminal', action: actions.splitTerminal, shortcut: 'Ctrl+Shift+5' },
        { type: 'separator' },
        { label: 'Kill All Terminals', action: () => {} }
      ]
    }
  ];

  const handleMenuClick = (menuKey) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    }
    setActiveMenu(null);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  return (
    <>
      <div className="h-10 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
        {/* Left side - Menu items */}
        <div className="flex items-center space-x-1">
          {/* Logo/Home */}
          <button
            onClick={onNavigate}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors mr-2"
            title="Go to Dashboard"
          >
            <FiHome className="w-4 h-4" />
          </button>

          {/* Menu items */}
          {menuItems.map((menu) => (
            <div key={menu.key} className="relative">
              <button
                onClick={() => handleMenuClick(menu.key)}
                className={`px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors ${
                  activeMenu === menu.key ? 'bg-gray-700 text-white' : ''
                }`}
              >
                {menu.label}
              </button>

              <AnimatePresence>
                {activeMenu === menu.key && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-[200px] z-50"
                  >
                    {menu.items.map((item, index) => (
                      <div key={index}>
                        {item.type === 'separator' ? (
                          <div className="border-t border-gray-600 my-1" />
                        ) : (
                          <button
                            onClick={() => handleItemClick(item)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              {item.icon && <item.icon className="w-4 h-4" />}
                              <span>{item.label}</span>
                            </div>
                            {item.shortcut && (
                              <span className="text-xs text-gray-500">
                                {item.shortcut}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Center - Project name */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <span className="font-medium">{project?.name || 'Untitled Project'}</span>
            {saving && (
              <span className="text-blue-400 text-xs">
                Saving...
              </span>
            )}
          </div>
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center space-x-3">
          {/* Connection status */}
          <div className="flex items-center space-x-1">
            {connected ? (
              <FiWifi className="w-4 h-4 text-green-400" />
            ) : (
              <FiWifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs text-gray-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Settings */}
          <button
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Settings"
          >
            <FiSettings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overlay to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeMenu}
        />
      )}
    </>
  );
};

export default MenuBar;

// src/components/Builder/TerminalPanel.jsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTerminal, FiX, FiPlus, FiMaximize2, FiMinimize2,
  FiColumns, FiRefreshCw, FiTrash2, FiCopy, FiDownload
} from 'react-icons/fi';

const TerminalPanel = forwardRef(({
  terminals,
  activeTerminal,
  socket,
  projectId,
  onTerminalCreate,
  onTerminalSelect,
  onTerminalClose
}, ref) => {
  const [terminalOutputs, setTerminalOutputs] = useState({});
  const [commandInputs, setCommandInputs] = useState({});
  const [commandHistory, setCommandHistory] = useState({});
  const [historyIndex, setHistoryIndex] = useState({});
  const terminalRefs = useRef({});

  useImperativeHandle(ref, () => ({
    appendOutput: (data) => {
      if (data.terminalId) {
        appendToTerminal(data.terminalId, data);
      }
    }
  }));

  useEffect(() => {
    // Initialize outputs for new terminals
    terminals.forEach(terminal => {
      if (!terminalOutputs[terminal.id]) {
        setTerminalOutputs(prev => ({
          ...prev,
          [terminal.id]: []
        }));
        setCommandInputs(prev => ({
          ...prev,
          [terminal.id]: ''
        }));
        setCommandHistory(prev => ({
          ...prev,
          [terminal.id]: []
        }));
        setHistoryIndex(prev => ({
          ...prev,
          [terminal.id]: -1
        }));
      }
    });
  }, [terminals]);

  useEffect(() => {
    // WebSocket event listeners
    if (socket) {
      socket.on('terminal:created', (data) => {
        onTerminalSelect(data.terminalId);
      });

      socket.on('terminal:output', (data) => {
        if (data && data.data) {
          appendToTerminal(activeTerminal, data.data);
        }
      });

      return () => {
        socket.off('terminal:created');
        socket.off('terminal:output');
      };
    }
  }, [socket, activeTerminal]);

  const appendToTerminal = (terminalId, outputData) => {
    if (!terminalId) return;
    
    setTerminalOutputs(prev => ({
      ...prev,
      [terminalId]: [
        ...(prev[terminalId] || []),
        {
          ...outputData,
          timestamp: new Date(),
          id: Date.now() + Math.random()
        }
      ]
    }));

    // Auto-scroll to bottom
    setTimeout(() => {
      if (terminalRefs.current[terminalId]) {
        terminalRefs.current[terminalId].scrollTop = 
          terminalRefs.current[terminalId].scrollHeight;
      }
    }, 100);
  };

  const executeCommand = (terminalId, command) => {
    if (!command.trim()) return;

    // Add command to output
    appendToTerminal(terminalId, {
      type: 'command',
      content: `$ ${command}`,
      timestamp: new Date()
    });

    // Add to command history
    setCommandHistory(prev => ({
      ...prev,
      [terminalId]: [...(prev[terminalId] || []), command]
    }));

    // Reset history index
    setHistoryIndex(prev => ({
      ...prev,
      [terminalId]: -1
    }));

    // Send command via WebSocket
    if (socket) {
      socket.emit('terminal:execute', {
        terminalId,
        command
      });
    }

    // Clear input
    setCommandInputs(prev => ({
      ...prev,
      [terminalId]: ''
    }));
  };

  const handleKeyDown = (e, terminalId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(terminalId, commandInputs[terminalId]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const history = commandHistory[terminalId] || [];
      const currentIndex = historyIndex[terminalId];
      const newIndex = Math.min(currentIndex + 1, history.length - 1);
      
      if (newIndex >= 0 && history[history.length - 1 - newIndex]) {
        setHistoryIndex(prev => ({
          ...prev,
          [terminalId]: newIndex
        }));
        setCommandInputs(prev => ({
          ...prev,
          [terminalId]: history[history.length - 1 - newIndex]
        }));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const history = commandHistory[terminalId] || [];
      const currentIndex = historyIndex[terminalId];
      const newIndex = Math.max(currentIndex - 1, -1);
      
      setHistoryIndex(prev => ({
        ...prev,
        [terminalId]: newIndex
      }));
      
      if (newIndex === -1) {
        setCommandInputs(prev => ({
          ...prev,
          [terminalId]: ''
        }));
      } else {
        setCommandInputs(prev => ({
          ...prev,
          [terminalId]: history[history.length - 1 - newIndex]
        }));
      }
    }
  };

  const clearTerminal = (terminalId) => {
    setTerminalOutputs(prev => ({
      ...prev,
      [terminalId]: []
    }));
  };

  const copyOutput = (terminalId) => {
    const output = terminalOutputs[terminalId] || [];
    const text = output.map(line => line.content).join('\n');
    navigator.clipboard.writeText(text);
  };

  const downloadOutput = (terminalId) => {
    const output = terminalOutputs[terminalId] || [];
    const text = output.map(line => 
      `[${line.timestamp?.toLocaleTimeString()}] ${line.content}`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-${terminalId}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTerminalOutput = (terminalId) => {
    const output = terminalOutputs[terminalId] || [];
    
    return (
      <div
        ref={el => terminalRefs.current[terminalId] = el}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black"
      >
        {output.length === 0 ? (
          <div className="text-gray-500">
            Terminal ready. Type your commands below.
          </div>
        ) : (
          output.map((line) => (
            <div
              key={line.id}
              className={`mb-1 ${
                line.type === 'command' ? 'text-green-400' :
                line.type === 'stderr' ? 'text-red-400' :
                line.type === 'stdout' ? 'text-gray-100' :
                'text-gray-300'
              }`}
            >
              {line.content}
            </div>
          ))
        )}
      </div>
    );
  };

  if (terminals.length === 0) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FiTerminal className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">No terminals open</p>
          <button
            onClick={onTerminalCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Terminal</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Terminal Tabs */}
      <div className="flex items-center bg-gray-900 border-b border-gray-700">
        <div className="flex-1 flex items-center overflow-x-auto">
          {terminals.map((terminal) => (
            <button
              key={terminal.id}
              onClick={() => onTerminalSelect(terminal.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm border-r border-gray-700 whitespace-nowrap ${
                terminal.id === activeTerminal
                  ? 'bg-black text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <FiTerminal className="w-4 h-4" />
              <span>{terminal.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTerminalClose(terminal.id);
                }}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
        
        {/* Terminal Actions */}
        <div className="flex items-center space-x-1 px-2">
          <button
            onClick={onTerminalCreate}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="New Terminal"
          >
            <FiPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              // Split terminal functionality
              onTerminalCreate();
            }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Split Terminal"
          >
            <FiColumns className="w-4 h-4" />
          </button>
          {activeTerminal && (
            <>
              <button
                onClick={() => clearTerminal(activeTerminal)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Clear Terminal"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => copyOutput(activeTerminal)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Copy Output"
              >
                <FiCopy className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadOutput(activeTerminal)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Download Output"
              >
                <FiDownload className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col">
        {activeTerminal ? (
          <>
            {/* Terminal Output */}
            {renderTerminalOutput(activeTerminal)}
            
            {/* Command Input */}
            <div className="bg-gray-900 border-t border-gray-700 p-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-mono">$</span>
                <input
                  type="text"
                  value={commandInputs[activeTerminal] || ''}
                  onChange={(e) => setCommandInputs(prev => ({
                    ...prev,
                    [activeTerminal]: e.target.value
                  }))}
                  onKeyDown={(e) => handleKeyDown(e, activeTerminal)}
                  className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none"
                  placeholder="Enter command..."
                  autoFocus
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a terminal to view</p>
          </div>
        )}
      </div>
    </div>
  );
});

TerminalPanel.displayName = 'TerminalPanel';

export default TerminalPanel;

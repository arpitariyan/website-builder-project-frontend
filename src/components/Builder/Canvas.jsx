// src/components/Builder/Canvas.jsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import ComponentRenderer from './ComponentRenderer';
import { FiPlus } from 'react-icons/fi';

const Canvas = ({ project, selectedComponent, onSelectComponent, onUpdateComponent }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const components = project?.content?.components || [];

  const handleComponentClick = (component, event) => {
    event.stopPropagation();
    onSelectComponent(component);
  };

  const handleCanvasClick = () => {
    onSelectComponent(null);
  };

  return (
    <div className="h-full relative bg-white">
      {/* Canvas Container */}
      <div className="h-full overflow-auto">
        <div
          ref={setNodeRef}
          onClick={handleCanvasClick}
          className={`min-h-full transition-all duration-200 ${
            isOver ? 'bg-primary-50 border-primary-300' : 'bg-white'
          }`}
          style={{
            backgroundImage: isOver 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(229, 231, 235, 0.5) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* Empty State */}
          {components.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start Building Your Website
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Drag components from the left panel to this canvas to start building your website.
                  You can rearrange and customize components as needed.
                </p>
              </div>
            </motion.div>
          )}

          {/* Render Components */}
          {components.map((component, index) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={(e) => handleComponentClick(component, e)}
              className={`relative transition-all duration-200 ${
                selectedComponent?.id === component.id
                  ? 'ring-2 ring-primary-500 ring-opacity-50'
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              style={{
                cursor: 'pointer',
                ...component.position && {
                  position: 'absolute',
                  left: component.position.x,
                  top: component.position.y,
                }
              }}
            >
              {/* Selection Indicator */}
              {selectedComponent?.id === component.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-8 left-0 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium z-10"
                >
                  {component.type}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary-600"></div>
                </motion.div>
              )}

              {/* Component Content */}
              <ComponentRenderer
                component={component}
                isSelected={selectedComponent?.id === component.id}
                onUpdate={(updates) => onUpdateComponent(component.id, updates)}
              />

              {/* Resize Handles */}
              {selectedComponent?.id === component.id && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner handles */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary-600 border border-white rounded-sm cursor-nw-resize pointer-events-auto"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 border border-white rounded-sm cursor-ne-resize pointer-events-auto"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary-600 border border-white rounded-sm cursor-sw-resize pointer-events-auto"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-600 border border-white rounded-sm cursor-se-resize pointer-events-auto"></div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Drop Zone Indicator */}
          {isOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-4 border-2 border-dashed border-primary-400 rounded-lg flex items-center justify-center pointer-events-none"
            >
              <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium">
                Drop component here
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Canvas Tools */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 shadow-sm">
          {components.length} components
        </div>
        
        {selectedComponent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm"
          >
            {selectedComponent.type} selected
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Canvas;

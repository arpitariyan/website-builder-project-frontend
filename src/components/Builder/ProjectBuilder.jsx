// src/components/Builder/ProjectBuilder.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import ComponentsPanel from './ComponentsPanel';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import LivePreview from './LivePreview';
import { FiLayers, FiSettings, FiCode } from 'react-icons/fi';

const ProjectBuilder = ({ project, onProjectChange }) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('components'); // 'components', 'properties', 'code'
  const [showPreview, setShowPreview] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (event) => {
    setDraggedItem(event.active);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over) return;

    // Handle dropping components onto canvas
    if (over.id === 'canvas-drop-zone') {
      const newComponent = {
        id: `component-${Date.now()}`,
        type: active.id,
        props: getDefaultProps(active.id),
        children: [],
        position: { x: 0, y: 0 }
      };

      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          components: [...(project.content?.components || []), newComponent]
        }
      };

      onProjectChange(updatedProject);
    }

    // Handle reordering components
    if (active.id !== over.id && project.content?.components) {
      const oldIndex = project.content.components.findIndex(c => c.id === active.id);
      const newIndex = project.content.components.findIndex(c => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedComponents = arrayMove(project.content.components, oldIndex, newIndex);
        const updatedProject = {
          ...project,
          content: {
            ...project.content,
            components: reorderedComponents
          }
        };
        onProjectChange(updatedProject);
      }
    }
  };

  const getDefaultProps = (componentType) => {
    const defaults = {
      text: { content: 'New Text', fontSize: '16px', color: '#000000' },
      button: { text: 'Button', color: 'primary', size: 'medium' },
      image: { src: '', alt: 'Image', width: '100%', height: 'auto' },
      container: { padding: '20px', backgroundColor: 'transparent' },
      heading: { content: 'New Heading', level: 'h2', fontSize: '24px' },
      link: { text: 'Link', href: '#', color: 'blue' }
    };
    return defaults[componentType] || {};
  };

  const updateComponent = (componentId, updates) => {
    const updatedComponents = project.content?.components?.map(component =>
      component.id === componentId ? { ...component, ...updates } : component
    ) || [];

    const updatedProject = {
      ...project,
      content: {
        ...project.content,
        components: updatedComponents
      }
    };

    onProjectChange(updatedProject);
  };

  const deleteComponent = (componentId) => {
    const updatedComponents = project.content?.components?.filter(
      component => component.id !== componentId
    ) || [];

    const updatedProject = {
      ...project,
      content: {
        ...project.content,
        components: updatedComponents
      }
    };

    onProjectChange(updatedProject);
    setSelectedComponent(null);
  };

  const tabs = [
    { id: 'components', label: 'Components', icon: FiLayers },
    { id: 'properties', label: 'Properties', icon: FiSettings },
    { id: 'code', label: 'Code', icon: FiCode }
  ];

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex bg-gray-100">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'components' && (
              <ComponentsPanel />
            )}
            {activeTab === 'properties' && (
              <PropertiesPanel
                component={selectedComponent}
                onUpdateComponent={updateComponent}
                onDeleteComponent={deleteComponent}
              />
            )}
            {activeTab === 'code' && (
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Custom Code</h3>
                <textarea
                  placeholder="Add custom CSS or JavaScript..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm font-mono"
                  value={project.content?.customCode || ''}
                  onChange={(e) => {
                    const updatedProject = {
                      ...project,
                      content: {
                        ...project.content,
                        customCode: e.target.value
                      }
                    };
                    onProjectChange(updatedProject);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {project.content?.components?.length || 0} components
              </span>
              {selectedComponent && (
                <span className="text-sm text-primary-600">
                  Selected: {selectedComponent.type}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  showPreview 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showPreview ? 'Design' : 'Preview'}
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            {showPreview ? (
              <LivePreview project={project} />
            ) : (
              <Canvas
                project={project}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                onUpdateComponent={updateComponent}
              />
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedItem ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg"
            >
              <span className="text-sm font-medium text-gray-700">
                {draggedItem.id}
              </span>
            </motion.div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default ProjectBuilder;

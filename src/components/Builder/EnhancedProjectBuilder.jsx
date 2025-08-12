// src/components/Builder/EnhancedProjectBuilder.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import Split from 'react-split';
import { toast } from 'react-hot-toast';

// Import existing components
import ComponentsPanel from './ComponentsPanel';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import CodePreview from './CodePreview';
import EnhancedLivePreview from './EnhancedLivePreview';

// Import icons
import { 
  FiLayers, 
  FiSettings, 
  FiCode, 
  FiEye, 
  FiLayout,
  FiColumns,
  FiZap
} from 'react-icons/fi';

// Import API service
import { generateCodeFromProject, generateFromFigma } from '../../services/api';

const EnhancedProjectBuilder = ({ project, onProjectChange }) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('components');
  const [viewMode, setViewMode] = useState('design'); // 'design', 'code', 'preview', 'split'
  const [draggedItem, setDraggedItem] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [splitSizes, setSplitSizes] = useState([50, 50]);

  const viewModes = [
    { id: 'design', label: 'Design', icon: FiLayout },
    { id: 'code', label: 'Code', icon: FiCode },
    { id: 'preview', label: 'Preview', icon: FiEye },
    { id: 'split', label: 'Split View', icon: FiColumns }
  ];

  const tabs = [
    { id: 'components', label: 'Components', icon: FiLayers },
    { id: 'properties', label: 'Properties', icon: FiSettings },
    { id: 'ai', label: 'AI Assistant', icon: FiZap }
  ];

  // Auto-generate code when project changes
  useEffect(() => {
    if (project?.content?.components?.length > 0) {
      handleGenerateCode();
    }
  }, [project?.content?.components]);

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
      toast.success(`${active.id} component added!`);
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
    toast.success('Component deleted');
  };

  const handleGenerateCode = async () => {
    if (!project?.content?.components?.length) {
      setGeneratedCode(null);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateCodeFromProject(project._id);
      setGeneratedCode(response.code);
      toast.success('Code generated successfully!');
    } catch (error) {
      console.error('Failed to generate code:', error);
      toast.error('Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromFigma = async (figmaUrl) => {
    if (!figmaUrl) {
      toast.error('Please provide a Figma URL');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateFromFigma(project._id, { figmaUrl });
      
      // Update project with generated components
      const updatedProject = {
        ...project,
        content: {
          ...project.content,
          components: response.components || [],
          figmaAnalysis: response.analysis
        }
      };
      
      onProjectChange(updatedProject);
      setGeneratedCode(response.code);
      toast.success('Generated from Figma design!');
    } catch (error) {
      console.error('Failed to generate from Figma:', error);
      toast.error('Failed to generate from Figma');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeChange = (newCode) => {
    setGeneratedCode(newCode);
  };

  const renderLeftPanel = () => (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs">{tab.label}</div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'components' && <ComponentsPanel />}
        
        {activeTab === 'properties' && (
          <PropertiesPanel
            component={selectedComponent}
            onUpdateComponent={updateComponent}
            onDeleteComponent={deleteComponent}
          />
        )}
        
        {activeTab === 'ai' && (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleGenerateCode}
                disabled={isGenerating || !project?.content?.components?.length}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FiZap className="w-4 h-4" />
                    Generate Code
                  </>
                )}
              </button>
              
              <div className="border-t pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generate from Figma
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Paste Figma URL..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleGenerateFromFigma(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Press Enter to generate from Figma design
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDesignCanvas = () => (
    <div className="flex-1 flex flex-col bg-gray-100">
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
      </div>
      
      <div className="flex-1">
        <Canvas
          project={project}
          selectedComponent={selectedComponent}
          onSelectComponent={setSelectedComponent}
          onUpdateComponent={updateComponent}
        />
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (viewMode) {
      case 'design':
        return renderDesignCanvas();
        
      case 'code':
        return (
          <CodePreview
            project={project}
            generatedCode={generatedCode}
            onCodeChange={handleCodeChange}
            isGenerating={isGenerating}
          />
        );
        
      case 'preview':
        return (
          <EnhancedLivePreview
            project={project}
            generatedCode={generatedCode}
            onRefresh={handleGenerateCode}
          />
        );
        
      case 'split':
        return (
          <Split
            sizes={splitSizes}
            minSize={300}
            expandToMin={false}
            gutterSize={8}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            className="flex-1 flex"
            onDragEnd={(sizes) => setSplitSizes(sizes)}
          >
            <div className="overflow-hidden">
              <CodePreview
                project={project}
                generatedCode={generatedCode}
                onCodeChange={handleCodeChange}
                isGenerating={isGenerating}
              />
            </div>
            <div className="overflow-hidden">
              <EnhancedLivePreview
                project={project}
                generatedCode={generatedCode}
                onRefresh={handleGenerateCode}
              />
            </div>
          </Split>
        );
        
      default:
        return renderDesignCanvas();
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex bg-gray-100">
        {/* Left Sidebar */}
        {renderLeftPanel()}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* View Mode Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {viewModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        viewMode === mode.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {isGenerating && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    AI Working...
                  </div>
                )}
                
                <button
                  onClick={handleGenerateCode}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FiZap className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {renderMainContent()}
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

export default EnhancedProjectBuilder;

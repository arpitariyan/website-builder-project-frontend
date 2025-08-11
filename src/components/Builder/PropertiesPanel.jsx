// src/components/Builder/PropertiesPanel.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiCopy, FiMove } from 'react-icons/fi';

const PropertiesPanel = ({ component, onUpdateComponent, onDeleteComponent }) => {
  if (!component) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FiMove className="w-6 h-6" />
        </div>
        <h3 className="font-medium text-gray-900 mb-1">No Component Selected</h3>
        <p className="text-sm">Click on a component in the canvas to edit its properties.</p>
      </div>
    );
  }

  const updateProp = (key, value) => {
    onUpdateComponent(component.id, {
      props: {
        ...component.props,
        [key]: value
      }
    });
  };

  const renderPropertyInputs = () => {
    const { type, props = {} } = component;

    const commonInputs = (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 text-sm">Layout & Spacing</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Padding</label>
            <input
              type="text"
              value={props.padding || ''}
              onChange={(e) => updateProp('padding', e.target.value)}
              placeholder="8px"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Margin</label>
            <input
              type="text"
              value={props.margin || ''}
              onChange={(e) => updateProp('margin', e.target.value)}
              placeholder="0"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={props.backgroundColor || '#ffffff'}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={props.backgroundColor || ''}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              placeholder="transparent"
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Border Radius</label>
          <input
            type="text"
            value={props.borderRadius || ''}
            onChange={(e) => updateProp('borderRadius', e.target.value)}
            placeholder="0"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    );

    switch (type) {
      case 'text':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-sm">Text Content</h4>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={props.content || ''}
                  onChange={(e) => updateProp('content', e.target.value)}
                  placeholder="Enter text content..."
                  rows={3}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                  <input
                    type="text"
                    value={props.fontSize || ''}
                    onChange={(e) => updateProp('fontSize', e.target.value)}
                    placeholder="16px"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    value={props.color || '#000000'}
                    onChange={(e) => updateProp('color', e.target.value)}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Font Weight</label>
                  <select
                    value={props.fontWeight || 'normal'}
                    onChange={(e) => updateProp('fontWeight', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Light</option>
                    <option value="bolder">Bolder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Text Align</label>
                  <select
                    value={props.textAlign || 'left'}
                    onChange={(e) => updateProp('textAlign', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>
              </div>
            </div>
            {commonInputs}
          </div>
        );

      case 'heading':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-sm">Heading Content</h4>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                <input
                  type="text"
                  value={props.content || ''}
                  onChange={(e) => updateProp('content', e.target.value)}
                  placeholder="Heading text..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={props.level || 'h2'}
                    onChange={(e) => updateProp('level', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                    <option value="h4">H4</option>
                    <option value="h5">H5</option>
                    <option value="h6">H6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                  <input
                    type="text"
                    value={props.fontSize || ''}
                    onChange={(e) => updateProp('fontSize', e.target.value)}
                    placeholder="24px"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={props.color || '#000000'}
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>
            {commonInputs}
          </div>
        );

      case 'button':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-sm">Button Content</h4>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={props.text || ''}
                  onChange={(e) => updateProp('text', e.target.value)}
                  placeholder="Button"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                  <input
                    type="color"
                    value={props.backgroundColor || '#3b82f6'}
                    onChange={(e) => updateProp('backgroundColor', e.target.value)}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={props.textColor || '#ffffff'}
                    onChange={(e) => updateProp('textColor', e.target.value)}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
            {commonInputs}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-sm">Image Properties</h4>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={props.src || ''}
                  onChange={(e) => updateProp('src', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={props.alt || ''}
                  onChange={(e) => updateProp('alt', e.target.value)}
                  placeholder="Image description"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                  <input
                    type="text"
                    value={props.width || ''}
                    onChange={(e) => updateProp('width', e.target.value)}
                    placeholder="100%"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                  <input
                    type="text"
                    value={props.height || ''}
                    onChange={(e) => updateProp('height', e.target.value)}
                    placeholder="auto"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            {commonInputs}
          </div>
        );

      case 'link':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-sm">Link Properties</h4>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={props.text || ''}
                  onChange={(e) => updateProp('text', e.target.value)}
                  placeholder="Link text"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={props.href || ''}
                  onChange={(e) => updateProp('href', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={props.color || '#3b82f6'}
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>
            {commonInputs}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-sm">Basic Properties</h4>
              <p className="text-sm text-gray-500">
                Properties for {type} component
              </p>
            </div>
            {commonInputs}
          </div>
        );
    }
  };

  return (
    <div className="p-4 overflow-y-auto">
      {/* Component Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 capitalize">{component.type}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                // Copy component logic
                console.log('Copy component:', component.id);
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Duplicate Component"
            >
              <FiCopy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteComponent(component.id)}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete Component"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
          ID: {component.id}
        </div>
      </div>

      {/* Properties Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderPropertyInputs()}
      </motion.div>
    </div>
  );
};

export default PropertiesPanel;

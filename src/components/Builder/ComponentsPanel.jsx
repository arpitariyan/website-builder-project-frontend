// src/components/Builder/ComponentsPanel.jsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { 
  FiType, 
  FiSquare, 
  FiImage, 
  FiLink, 
  FiGrid, 
  FiList,
  FiPlay,
  FiMap,
  FiMail,
  FiPhone
} from 'react-icons/fi';

const DraggableComponent = ({ id, icon: Icon, label, description }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-3 border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-50 hover:border-primary-300 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
          <Icon className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 truncate">{description}</div>
        </div>
      </div>
    </motion.div>
  );
};

const ComponentsPanel = () => {
  const componentCategories = [
    {
      name: 'Basic',
      components: [
        {
          id: 'text',
          icon: FiType,
          label: 'Text',
          description: 'Add text content'
        },
        {
          id: 'heading',
          icon: FiType,
          label: 'Heading',
          description: 'Add headings (H1-H6)'
        },
        {
          id: 'button',
          icon: FiSquare,
          label: 'Button',
          description: 'Interactive button'
        },
        {
          id: 'link',
          icon: FiLink,
          label: 'Link',
          description: 'Clickable link'
        },
        {
          id: 'image',
          icon: FiImage,
          label: 'Image',
          description: 'Add images'
        }
      ]
    },
    {
      name: 'Layout',
      components: [
        {
          id: 'container',
          icon: FiSquare,
          label: 'Container',
          description: 'Layout container'
        },
        {
          id: 'grid',
          icon: FiGrid,
          label: 'Grid',
          description: 'Grid layout'
        },
        {
          id: 'flexbox',
          icon: FiList,
          label: 'Flexbox',
          description: 'Flexible layout'
        },
        {
          id: 'section',
          icon: FiSquare,
          label: 'Section',
          description: 'Page section'
        }
      ]
    },
    {
      name: 'Media',
      components: [
        {
          id: 'video',
          icon: FiPlay,
          label: 'Video',
          description: 'Embed videos'
        },
        {
          id: 'gallery',
          icon: FiImage,
          label: 'Gallery',
          description: 'Image gallery'
        },
        {
          id: 'map',
          icon: FiMap,
          label: 'Map',
          description: 'Embedded map'
        }
      ]
    },
    {
      name: 'Forms',
      components: [
        {
          id: 'form',
          icon: FiMail,
          label: 'Form',
          description: 'Contact form'
        },
        {
          id: 'input',
          icon: FiSquare,
          label: 'Input',
          description: 'Text input field'
        },
        {
          id: 'textarea',
          icon: FiSquare,
          label: 'Textarea',
          description: 'Multi-line text'
        },
        {
          id: 'select',
          icon: FiList,
          label: 'Select',
          description: 'Dropdown select'
        }
      ]
    }
  ];

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Components</h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag components onto the canvas to build your website.
        </p>
      </div>

      {componentCategories.map((category) => (
        <div key={category.name}>
          <h4 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">
            {category.name}
          </h4>
          <div className="space-y-2">
            {category.components.map((component) => (
              <DraggableComponent
                key={component.id}
                id={component.id}
                icon={component.icon}
                label={component.label}
                description={component.description}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Quick Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag components to the canvas</li>
          <li>• Click to select and edit</li>
          <li>• Use properties panel to customize</li>
          <li>• Preview your changes anytime</li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentsPanel;

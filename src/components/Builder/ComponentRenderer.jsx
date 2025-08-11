// src/components/Builder/ComponentRenderer.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ComponentRenderer = ({ component, isSelected, onUpdate }) => {
  const { type, props = {} } = component;

  const commonStyles = {
    padding: props.padding || '8px',
    margin: props.margin || '0',
    backgroundColor: props.backgroundColor || 'transparent',
    border: props.border || 'none',
    borderRadius: props.borderRadius || '0',
  };

  const renderComponent = () => {
    switch (type) {
      case 'text':
        return (
          <p
            style={{
              ...commonStyles,
              fontSize: props.fontSize || '16px',
              color: props.color || '#000000',
              fontWeight: props.fontWeight || 'normal',
              textAlign: props.textAlign || 'left',
              lineHeight: props.lineHeight || '1.5',
            }}
            contentEditable={isSelected}
            onBlur={(e) => onUpdate({ props: { ...props, content: e.target.textContent } })}
            suppressContentEditableWarning={true}
          >
            {props.content || 'Click to edit text'}
          </p>
        );

      case 'heading':
        const HeadingTag = props.level || 'h2';
        return React.createElement(
          HeadingTag,
          {
            style: {
              ...commonStyles,
              fontSize: props.fontSize || '24px',
              color: props.color || '#000000',
              fontWeight: props.fontWeight || 'bold',
              textAlign: props.textAlign || 'left',
              lineHeight: props.lineHeight || '1.2',
            },
            contentEditable: isSelected,
            onBlur: (e) => onUpdate({ props: { ...props, content: e.target.textContent } }),
            suppressContentEditableWarning: true,
          },
          props.content || 'Click to edit heading'
        );

      case 'button':
        return (
          <button
            style={{
              ...commonStyles,
              fontSize: props.fontSize || '14px',
              color: props.textColor || '#ffffff',
              backgroundColor: props.backgroundColor || '#3b82f6',
              border: props.border || 'none',
              borderRadius: props.borderRadius || '6px',
              padding: props.padding || '8px 16px',
              cursor: 'pointer',
              fontWeight: props.fontWeight || '500',
            }}
            onClick={(e) => isSelected && e.preventDefault()}
          >
            {props.text || 'Button'}
          </button>
        );

      case 'image':
        return (
          <div style={commonStyles}>
            {props.src ? (
              <img
                src={props.src}
                alt={props.alt || 'Image'}
                style={{
                  width: props.width || '100%',
                  height: props.height || 'auto',
                  objectFit: props.objectFit || 'cover',
                  borderRadius: props.borderRadius || '0',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-2xl mb-2">🖼️</div>
                  <div className="text-sm">Click to add image</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'link':
        return (
          <a
            href={props.href || '#'}
            style={{
              ...commonStyles,
              color: props.color || '#3b82f6',
              textDecoration: props.textDecoration || 'underline',
              fontSize: props.fontSize || '16px',
              fontWeight: props.fontWeight || 'normal',
            }}
            onClick={(e) => isSelected && e.preventDefault()}
            contentEditable={isSelected}
            onBlur={(e) => onUpdate({ props: { ...props, text: e.target.textContent } })}
            suppressContentEditableWarning={true}
          >
            {props.text || 'Click to edit link'}
          </a>
        );

      case 'container':
        return (
          <div
            style={{
              ...commonStyles,
              minHeight: props.minHeight || '100px',
              display: props.display || 'block',
              flexDirection: props.flexDirection || 'column',
              justifyContent: props.justifyContent || 'flex-start',
              alignItems: props.alignItems || 'stretch',
              gap: props.gap || '0',
            }}
          >
            {props.content || (
              <div className="text-gray-400 text-center py-8">
                Container - Drop components here
              </div>
            )}
          </div>
        );

      case 'grid':
        return (
          <div
            style={{
              ...commonStyles,
              display: 'grid',
              gridTemplateColumns: props.columns || 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: props.gap || '16px',
              minHeight: props.minHeight || '200px',
            }}
          >
            {props.children?.length > 0 ? (
              props.children.map((child, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded p-4">
                  Grid Item {index + 1}
                </div>
              ))
            ) : (
              <div className="col-span-full text-gray-400 text-center py-8">
                Grid Layout - Add items
              </div>
            )}
          </div>
        );

      case 'flexbox':
        return (
          <div
            style={{
              ...commonStyles,
              display: 'flex',
              flexDirection: props.direction || 'row',
              justifyContent: props.justifyContent || 'flex-start',
              alignItems: props.alignItems || 'flex-start',
              gap: props.gap || '16px',
              flexWrap: props.wrap || 'nowrap',
              minHeight: props.minHeight || '100px',
            }}
          >
            {props.children?.length > 0 ? (
              props.children.map((child, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded p-4 flex-1">
                  Flex Item {index + 1}
                </div>
              ))
            ) : (
              <div className="flex-1 text-gray-400 text-center py-8">
                Flex Layout - Add items
              </div>
            )}
          </div>
        );

      case 'section':
        return (
          <section
            style={{
              ...commonStyles,
              minHeight: props.minHeight || '200px',
              padding: props.padding || '40px 20px',
            }}
          >
            {props.content || (
              <div className="text-gray-400 text-center">
                Section - Add content here
              </div>
            )}
          </section>
        );

      case 'form':
        return (
          <form
            style={commonStyles}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </div>
          </form>
        );

      default:
        return (
          <div
            style={{
              ...commonStyles,
              padding: '20px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Unknown component: {type}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`relative ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
    >
      {renderComponent()}
    </motion.div>
  );
};

export default ComponentRenderer;

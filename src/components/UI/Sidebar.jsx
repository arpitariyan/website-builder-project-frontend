// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, 
  FiFolder, 
  FiLayers, 
  FiSettings, 
  FiLogOut, 
  FiUser,
  FiHelpCircle
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: FiHome,
      path: '/dashboard',
      description: 'Overview of your projects'
    },
    {
      name: 'My Projects',
      icon: FiFolder,
      path: '/dashboard',
      description: 'Manage your websites'
    },
    {
      name: 'Templates',
      icon: FiLayers,
      path: '/templates',
      description: 'Browse design templates'
    },
    {
      name: 'Settings',
      icon: FiSettings,
      path: '/settings',
      description: 'Account preferences'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">WebsiteBuilder</h1>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <FiUser className="w-5 h-5 text-primary-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {item.name}
                    </div>
                    <div className="text-xs opacity-75">
                      {item.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="w-1 h-6 bg-primary-600 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200">
          <FiHelpCircle className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium">Help & Support</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* Version Info */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-400">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;

// src/components/UI/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiSettings, FiUser, FiKey, FiCpu, FiDownload, 
  FiTrash2, FiSave, FiEye, FiEyeOff, FiCheck, FiAlertTriangle
} from 'react-icons/fi';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    profile: {
      firstName: '',
      lastName: '',
      company: '',
      website: '',
      bio: ''
    },
    preferences: {
      defaultAiProvider: 'openai',
      codeStyle: 'react',
      theme: 'light'
    }
  });

  const [apiKeys, setApiKeys] = useState([]);
  const [figmaToken, setFigmaToken] = useState('');
  const [showApiKeys, setShowApiKeys] = useState({});
  const [newApiKey, setNewApiKey] = useState({
    provider: 'openai',
    name: '',
    key: '',
    models: [],
    defaultModel: ''
  });

  const providers = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'gemini', name: 'Google Gemini', models: ['gemini-pro', 'gemini-pro-vision'] },
    { id: 'claude', name: 'Anthropic Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
    { id: 'openrouter', name: 'OpenRouter', models: ['openai/gpt-4', 'anthropic/claude-3-opus', 'google/gemini-pro'] }
  ];

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'apikeys', name: 'API Keys', icon: FiKey },
    { id: 'preferences', name: 'Preferences', icon: FiSettings },
    { id: 'data', name: 'Data', icon: FiDownload }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
      fetchApiKeys();
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/settings/profile');
      setProfile(response.data.profile);
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await apiService.get('/apikeys');
      setApiKeys(response.data.apiKeys);
      if (response.data.figmaToken) {
        setFigmaToken('••••••••••••••••'); // Show masked token
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      await apiService.put('/settings/profile', {
        profile: profile.profile,
        preferences: profile.preferences
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addApiKey = async () => {
    if (!newApiKey.name || !newApiKey.key) {
      toast.error('Please provide both name and API key');
      return;
    }

    try {
      setLoading(true);
      await apiService.post('/apikeys', newApiKey);
      toast.success('API key added successfully');
      setNewApiKey({ provider: 'openai', name: '', key: '', models: [], defaultModel: '' });
      fetchApiKeys();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add API key');
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (keyId) => {
    try {
      await apiService.delete(`/apikeys/${keyId}`);
      toast.success('API key deleted');
      fetchApiKeys();
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const addFigmaToken = async () => {
    if (!figmaToken || figmaToken === '••••••••••••••••') {
      toast.error('Please enter a valid Figma token');
      return;
    }

    try {
      setLoading(true);
      await apiService.post('/apikeys/figma', { token: figmaToken });
      toast.success('Figma token added successfully');
      fetchApiKeys();
    } catch (error) {
      toast.error('Failed to add Figma token');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/settings/export');
      const blob = new Blob([JSON.stringify(response.data.exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `website-builder-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const toggleApiKeyVisibility = (keyId) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-80px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 bg-gray-50">
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={profile.profile?.firstName || ''}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              profile: { ...prev.profile, firstName: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={profile.profile?.lastName || ''}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              profile: { ...prev.profile, lastName: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={profile.profile?.company || ''}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              profile: { ...prev.profile, company: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            value={profile.profile?.website || ''}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              profile: { ...prev.profile, website: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profile.profile?.bio || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            profile: { ...prev.profile, bio: e.target.value }
                          }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                    <Button onClick={updateProfile} disabled={loading}>
                      {loading ? <LoadingSpinner size="sm" /> : <FiSave className="w-4 h-4" />}
                      Save Profile
                    </Button>
                  </div>
                )}

                {activeTab === 'apikeys' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">API Keys</h3>
                      
                      {/* Add New API Key */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Add New API Key</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Provider
                            </label>
                            <select
                              value={newApiKey.provider}
                              onChange={(e) => setNewApiKey(prev => ({ ...prev, provider: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              {providers.map(provider => (
                                <option key={provider.id} value={provider.id}>
                                  {provider.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={newApiKey.name}
                              onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="My API Key"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              API Key
                            </label>
                            <input
                              type="password"
                              value={newApiKey.key}
                              onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                              placeholder="sk-..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <Button onClick={addApiKey} disabled={loading} className="mt-4">
                          Add API Key
                        </Button>
                      </div>

                      {/* Existing API Keys */}
                      <div className="space-y-4">
                        {apiKeys.map((key) => (
                          <div key={key._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{key.name}</h4>
                                <p className="text-sm text-gray-500 capitalize">{key.provider}</p>
                                {key.defaultModel && (
                                  <p className="text-xs text-gray-400">Default: {key.defaultModel}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => deleteApiKey(key._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Figma Token */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-3">Figma Personal Access Token</h4>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={figmaToken}
                            onChange={(e) => setFigmaToken(e.target.value)}
                            placeholder="figd_..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <Button onClick={addFigmaToken} disabled={loading}>
                            Save
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Get your token from Figma Settings → Account → Personal Access Tokens
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default AI Provider
                          </label>
                          <select
                            value={profile.preferences?.defaultAiProvider || 'openai'}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, defaultAiProvider: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {providers.map(provider => (
                              <option key={provider.id} value={provider.id}>
                                {provider.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Code Style
                          </label>
                          <select
                            value={profile.preferences?.codeStyle || 'react'}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, codeStyle: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="react">React</option>
                            <option value="vanilla">Vanilla JS</option>
                            <option value="vue">Vue.js</option>
                            <option value="angular">Angular</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                          </label>
                          <select
                            value={profile.preferences?.theme || 'light'}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, theme: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>
                      </div>
                      <Button onClick={updateProfile} disabled={loading} className="mt-4">
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Download all your profile data, projects, and learning patterns in JSON format.
                          </p>
                          <Button onClick={exportData} disabled={loading}>
                            <FiDownload className="w-4 h-4" />
                            Export Data
                          </Button>
                        </div>
                        
                        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                          <p className="text-sm text-red-600 mb-4">
                            These actions cannot be undone. Please be certain before proceeding.
                          </p>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (confirm('Clear all learning data? This cannot be undone.')) {
                                  // Clear learning data logic
                                }
                              }}
                            >
                              Clear Learning Data
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;

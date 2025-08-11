// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BuilderPage from './pages/BuilderPage';
import TemplatesPage from './pages/TemplatesPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/templates" 
                element={
                  <ProtectedRoute>
                    <TemplatesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/builder/:projectId" 
                element={
                  <ProtectedRoute>
                    <BuilderPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;

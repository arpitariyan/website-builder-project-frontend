// src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FiArrowRight, FiPlay, FiZap, FiLayers, FiSmartphone, FiCode } from 'react-icons/fi';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "Drag & Drop Builder",
      description: "Create stunning websites with our intuitive drag and drop interface. No coding required."
    },
    {
      icon: <FiLayers className="w-8 h-8" />,
      title: "Pre-built Templates",
      description: "Choose from hundreds of professional templates designed for every industry."
    },
    {
      icon: <FiSmartphone className="w-8 h-8" />,
      title: "Mobile Responsive",
      description: "All websites are automatically optimized for desktop, tablet, and mobile devices."
    },
    {
      icon: <FiCode className="w-8 h-8" />,
      title: "Export Clean Code",
      description: "Download production-ready HTML, CSS, and JavaScript code for your website."
    }
  ];

  const templates = [
    {
      id: 1,
      name: "Business Pro",
      category: "Business",
      image: "/api/placeholder/300/200",
      description: "Professional business website template"
    },
    {
      id: 2,
      name: "Portfolio Creative",
      category: "Portfolio",
      image: "/api/placeholder/300/200",
      description: "Showcase your work with this creative portfolio"
    },
    {
      id: 3,
      name: "E-commerce Store",
      category: "E-commerce",
      image: "/api/placeholder/300/200",
      description: "Complete online store template"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">WebsiteBuilder</h1>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
                <a href="#templates" className="text-gray-600 hover:text-primary-600 transition-colors">Templates</a>
                <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">Pricing</a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Build Beautiful Websites
              <span className="text-gradient"> Without Code</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Create stunning, responsive websites with our powerful drag-and-drop builder. 
              No coding skills required. Launch your digital presence in minutes, not hours.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link 
                to="/signup"
                className="btn btn-primary px-8 py-3 text-lg font-semibold inline-flex items-center gap-2 group"
              >
                Start Building Now
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="btn btn-ghost px-8 py-3 text-lg font-semibold inline-flex items-center gap-2 group">
                <FiPlay className="w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20"
            />
            <motion.div 
              animate={{ 
                y: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-40 right-20 w-32 h-32 bg-secondary-200 rounded-full opacity-20"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Build Amazing Websites
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools and features you need to create professional websites that engage your audience and grow your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose from Professional Templates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with a template that matches your vision. All templates are fully customizable and mobile-responsive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500">Template Preview</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span className="text-sm text-primary-600 bg-primary-100 px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {template.description}
                  </p>
                  <button className="w-full btn btn-ghost group-hover:btn-primary transition-all duration-300">
                    Use Template
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/templates"
              className="btn btn-primary px-8 py-3 inline-flex items-center gap-2"
            >
              View All Templates
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Build Your Dream Website?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join thousands of users who have already created amazing websites with our platform. Start your journey today.
            </p>
            <Link 
              to="/signup"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              Get Started Free
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">WebsiteBuilder</h3>
              <p className="text-gray-400">
                The easiest way to create beautiful, professional websites without any coding knowledge.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WebsiteBuilder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

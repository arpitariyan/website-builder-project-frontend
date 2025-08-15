// src/utils/codeTemplates.js

export const generatePackageJson = (type) => {
  if (type === 'frontend') {
    return JSON.stringify({
      name: "frontend",
      version: "0.1.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1",
        "axios": "^1.5.0",
        "@testing-library/jest-dom": "^5.16.4",
        "@testing-library/react": "^13.3.0",
        "@testing-library/user-event": "^13.5.0"
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      eslintConfig: {
        extends: ["react-app", "react-app/jest"]
      },
      browserslist: {
        production: [">0.2%", "not dead", "not op_mini all"],
        development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
      }
    }, null, 2);
  } else {
    return JSON.stringify({
      name: "backend",
      version: "1.0.0",
      description: "Backend API server",
      main: "server.js",
      scripts: {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "test": "jest"
      },
      dependencies: {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "mongoose": "^7.5.0",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2"
      },
      devDependencies: {
        "nodemon": "^3.0.1",
        "jest": "^29.7.0"
      }
    }, null, 2);
  }
};

export const generateReactApp = (project) => {
  return `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${project.name}</h1>
        <p>${project.description}</p>
        <div className="hero-section">
          <h2>Welcome to ${project.name}</h2>
          <p>This is an AI-generated ${project.category} project.</p>
        </div>
      </header>
    </div>
  );
}

export default App;`;
};

export const generateReactIndex = () => {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
};

export const generateHtmlTemplate = (project) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${project.description}" />
    <title>${project.name}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
};

export const generateExpressServer = (project) => {
  return `const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '${project.name} API Server',
    description: '${project.description}',
    status: 'active'
  });
});

// API Routes
app.use('/api', require('./routes/api'));

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`;
};

export const generateApiRoutes = (project) => {
  return `const express = require('express');
const router = express.Router();

// GET /api/health
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: '${project.name} API'
  });
});

// Sample API endpoints based on project category
${getApiEndpointsByCategory(project.category)}

module.exports = router;`;
};

export const generateStaticHtml = (project) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="container">
        <header class="hero-section">
            <h1>${project.name}</h1>
            <p>${project.description}</p>
        </header>
        
        <main class="main-content">
            <section class="content-section">
                <h2>Welcome</h2>
                <p>This is an AI-generated ${project.category} website.</p>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2024 ${project.name}. All rights reserved.</p>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`;
};

export const generateBasicCss = (project) => {
  return `/* Global Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Hero Section */
.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.hero-section h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: 700;
}

.hero-section p {
    font-size: 1.25rem;
    opacity: 0.9;
}

/* Main Content */
.main-content {
    padding: 4rem 0;
}

.content-section {
    margin-bottom: 3rem;
}

.content-section h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2d3748;
}

/* Footer */
.footer {
    background: #2d3748;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-section h1 {
        font-size: 2rem;
    }
    
    .hero-section p {
        font-size: 1rem;
    }
}`;
};

export const generateBasicJs = (project) => {
  return `// ${project.name} - JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('${project.name} loaded successfully!');
    
    // Add smooth scrolling
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation to elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = \`notification notification-\${type}\`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification
    };
}`;
};

function getApiEndpointsByCategory(category) {
  switch (category) {
    case 'e-commerce':
      return `
// Product endpoints
router.get('/products', (req, res) => {
  res.json({ products: [] });
});

router.post('/products', (req, res) => {
  res.json({ message: 'Product created' });
});

// Order endpoints
router.get('/orders', (req, res) => {
  res.json({ orders: [] });
});

router.post('/orders', (req, res) => {
  res.json({ message: 'Order created' });
});`;

    case 'blog':
      return `
// Blog post endpoints
router.get('/posts', (req, res) => {
  res.json({ posts: [] });
});

router.post('/posts', (req, res) => {
  res.json({ message: 'Post created' });
});

router.get('/posts/:id', (req, res) => {
  res.json({ post: {} });
});`;

    case 'business':
      return `
// Contact endpoints
router.post('/contact', (req, res) => {
  res.json({ message: 'Contact form submitted' });
});

// Services endpoints
router.get('/services', (req, res) => {
  res.json({ services: [] });
});`;

    default:
      return `
// Generic endpoints
router.get('/data', (req, res) => {
  res.json({ data: [] });
});

router.post('/data', (req, res) => {
  res.json({ message: 'Data created' });
});`;
  }
}

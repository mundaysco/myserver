const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// ====== MIDDLEWARE ======
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ====== ROUTES ======

// Root endpoint - JSON response
app.get('/', (req, res) => {
  res.json({
    message: 'Max Clover API Server',
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    endpoints: {
      root: 'GET /',
      health: 'GET /health',
      auth: 'GET /auth',
      callback: 'GET /callback'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Max Clover Server',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth endpoint (Clover OAuth)
app.get('/auth', (req, res) => {
  const cloverAuthUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${process.env.CLOVER_APP_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code`;
  res.json({
    message: 'Redirect to Clover OAuth',
    auth_url: cloverAuthUrl,
    redirect: true
  });
});

// Callback endpoint (Clover OAuth callback)
app.get('/callback', (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.status(400).json({
      error: 'OAuth authorization failed',
      error_description: error
    });
  }
  
  if (!code) {
    return res.status(400).json({
      error: 'Missing authorization code'
    });
  }
  
  res.json({
    message: 'OAuth callback received',
    code: code,
    next_step: 'Exchange code for access token'
  });
});

// ====== ERROR HANDLING ======

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    available_routes: ['/', '/health', '/auth', '/callback']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// ====== SERVER START ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Max Clover API Server started`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🚀 Production URL: https://myserver-wk8h.onrender.com`);
  } else {
    console.log(`🔧 Local URL: http://localhost:${PORT}`);
  }
  
  console.log('\n📋 Loaded Environment Variables:');
  console.log(`   App ID: ${process.env.CLOVER_APP_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   App Secret: ${process.env.CLOVER_APP_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Redirect URI: ${process.env.REDIRECT_URI || '❌ Missing'}`);
  console.log(`   Site URL: ${process.env.SITE_URL || '❌ Missing'}`);
});

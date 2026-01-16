const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Your existing routes here (auth, callback, etc.)
// Make sure you have these routes defined

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Max Clover Server is running',
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    endpoints: ['/', '/health', '/auth', '/callback']
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Max Clover Server'
  });
});

const PORT = process.env.PORT || 3000;

// Development setup instructions
if (process.env.NODE_ENV !== 'production') {
  console.log("=== MAX CLOVER APP ===");
  console.log(`App ID: ${process.env.CLOVER_APP_ID}`);
  console.log("App Secret: ✅ Set");
  console.log(`Redirect URI: ${process.env.REDIRECT_URI}`);
  console.log("=============================");
  console.log("📝 Setup Instructions:");
  console.log("1. Start ngrok: ngrok http 3000");
  console.log("2. Update .env with ngrok URL");
  console.log("3. Configure Clover Dashboard");
  console.log("4. Install app from Clover App Market");
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🚀 Production: https://myserver-wk8h.onrender.com`);
  } else {
    console.log(`🔧 Development: http://localhost:${PORT}`);
  }
});

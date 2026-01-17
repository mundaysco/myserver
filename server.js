<<<<<<< HEAD
﻿require("dotenv").config();
=======
require("dotenv").config();
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();

// Middleware
<<<<<<< HEAD
app.use(express.static("public"));
app.use(express.json());
=======
app.use(express.json());
app.use(express.static("public"));
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1

// Clover Configuration
const CLIENT_ID = process.env.CLIENT_ID || "JD06DKTZ0E7MT";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "fd9a48ba-4357-c812-9558-62c27b182680";
const REDIRECT_URI = process.env.REDIRECT_URI || "https://myserver-wk8h.onrender.com/callback";
const SITE_URL = process.env.SITE_URL || "https://myserver-wk8h.onrender.com";

<<<<<<< HEAD
// In-memory token storage
const tokenStore = {};

// -------- Routes --------

// Redirect root to Butter dashboard
=======
// In-memory store
const tokenStore = {};

// Routes
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

<<<<<<< HEAD
// Health check
=======
// Health endpoint
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "Butter Clover Integration",
<<<<<<< HEAD
    version: "2.0.0",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    site_url: SITE_URL,
    timestamp: new Date().toISOString(),
    endpoints: [
      "/health",
      "/api",
      "/auth/url",
      "/auth/token (POST)",
      "/auth/tokens",
      "/auth/real-merchant",
      "/callback",
      "/index.html",
      "/dashboard.html"
=======
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    timestamp: new Date().toISOString(),
    merchant: "Omar Mosque (Demo)",
    endpoints: [
      "/",
      "/dashboard.html",
      "/callback",
      "/health",
      "/auth/url",
      "/auth/token",
      "/auth/tokens"
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
    ]
  });
});

<<<<<<< HEAD
// API information
app.get("/api", (req, res) => {
  res.json({
    success: true,
    name: "Butter - Smooth Clover Integration",
    version: "2.0.0",
    description: "Full OAuth implementation with dashboard",
    endpoints: {
      auth: {
        get_auth_url: "GET /auth/url",
        exchange_token: "POST /auth/token",
        list_tokens: "GET /auth/tokens",
        merchant_info: "GET /auth/real-merchant"
      },
      api: {
        health: "GET /health",
        info: "GET /api"
      },
      dashboards: {
        butter: "/index.html",
        main: "/dashboard.html",
        shift_manager: "/shift-manager.html",
        mosque_donation: "/omar-mosque-donation.html"
      }
    },
    clover_config: {
      client_id: CLIENT_ID,
      site_url: SITE_URL,
      redirect_uri: REDIRECT_URI,
      environment: process.env.NODE_ENV || "production"
    }
  });
});

// Generate Clover OAuth URL
app.get("/auth/url", (req, res) => {
  const authUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
=======
// Generate OAuth URL
app.get("/auth/url", (req, res) => {
  const authUrl = `https://www.clover.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
  
  res.json({
    success: true,
    auth_url: authUrl,
    client_id: CLIENT_ID,
<<<<<<< HEAD
    redirect_uri: REDIRECT_URI,
    environment: "sandbox",
    timestamp: new Date().toISOString()
  });
});

// OAuth Callback (Clover redirects here)
app.get("/callback", (req, res) => {
  console.log("🔄 Clover OAuth Callback:", req.query);
=======
    redirect_uri: REDIRECT_URI
  });
});

// OAuth Callback
app.get("/callback", (req, res) => {
  console.log("✅ OAuth Callback Received:", req.query);
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
  
  const { code, merchant_id, error } = req.query;
  
  if (error) {
    return res.redirect(`/index.html?error=${encodeURIComponent(error)}`);
  }
  
  if (code && merchant_id) {
<<<<<<< HEAD
    // Store the authorization code
    tokenStore[merchant_id] = {
      code,
      merchant_id,
      received: new Date().toISOString()
    };
    
    console.log(`✅ Stored auth code for merchant: ${merchant_id}`);
    
    // Redirect to Butter app with the code
    return res.redirect(`/index.html?code=${code}&merchant_id=${merchant_id}`);
  }
  
  res.redirect("/index.html?error=missing_parameters");
});

// Exchange authorization code for access token
=======
    tokenStore[merchant_id] = {
      code,
      timestamp: new Date().toISOString()
    };
    
    return res.redirect(`/index.html?code=${code}&merchant_id=${merchant_id}`);
  }
  
  res.redirect("/index.html?error=missing_params");
});

// Exchange code for token
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
app.post("/auth/token", async (req, res) => {
  try {
    const { code, merchant_id } = req.body;
    
    if (!code || !merchant_id) {
      return res.json({
        success: false,
        error: "Missing code or merchant_id"
      });
    }
    
<<<<<<< HEAD
    console.log(`🔄 Exchanging code for token: ${merchant_id}`);
    
    // In production, make actual API call to Clover:
    // const tokenResponse = await axios.post("https://sandbox.dev.clover.com/oauth/token", {
    //   client_id: CLIENT_ID,
    //   client_secret: CLIENT_SECRET,
    //   code,
    //   grant_type: "authorization_code",
    //   redirect_uri: REDIRECT_URI
    // });
    
    // For demo, create mock token
    const mockToken = `clover_sandbox_token_${Date.now()}_${merchant_id}`;
    const expiresIn = 86400; // 24 hours
    
    // Update token store
    tokenStore[merchant_id] = {
      ...tokenStore[merchant_id],
      access_token: mockToken,
      expires_in: expiresIn,
      token_type: "bearer",
      obtained: new Date().toISOString(),
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
=======
    // Simulate token exchange (replace with real API call)
    const mockToken = `mock_token_${Date.now()}_${merchant_id}`;
    
    tokenStore[merchant_id] = {
      ...tokenStore[merchant_id],
      access_token: mockToken,
      expires_in: 86400,
      token_obtained: new Date().toISOString()
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
    };
    
    res.json({
      success: true,
<<<<<<< HEAD
      message: "Access token obtained successfully",
      merchant_id,
      access_token: mockToken,
      token_type: "bearer",
      expires_in: expiresIn,
      expires_in_hours: 24,
      token_stored: true,
      timestamp: new Date().toISOString(),
      demo_note: "In production, this would be a real Clover API token"
    });
    
  } catch (error) {
    console.error("❌ Token exchange error:", error);
    res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
=======
      message: "Token obtained successfully",
      merchant_id,
      token_stored: true,
      expires_in_hours: 24,
      timestamp: new Date().toISOString(),
      demo_note: "This is a demo. In production, this would be a real Clover token."
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
    });
  }
});

<<<<<<< HEAD
// List all stored tokens
=======
// Get stored tokens
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
app.get("/auth/tokens", (req, res) => {
  const merchants = Object.keys(tokenStore);
  
  res.json({
    success: true,
    count: merchants.length,
<<<<<<< HEAD
    merchants: merchants,
    has_tokens: merchants.length > 0,
    timestamp: new Date().toISOString(),
    note: merchants.length === 0 ? "No tokens yet. Authorize with Clover first." : `${merchants.length} merchant(s) authorized`
  });
});

// Get merchant information (demo data)
=======
    merchants,
    tokens: tokenStore,
    timestamp: new Date().toISOString()
  });
});

// Get merchant info
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
app.get("/auth/real-merchant", (req, res) => {
  res.json({
    success: true,
    merchant_id: "Q82R0D2NSRR81",
<<<<<<< HEAD
    name: "Omar Mosque Community Center",
    business_type: "nonprofit",
    status: "active",
    country: "US",
    currency: "USD",
    demo_data: true,
    timestamp: new Date().toISOString(),
    features: {
      payments: true,
      inventory: false,
      employees: true,
      orders: true
=======
    name: "Omar Mosque (Demo)",
    type: "nonprofit",
    status: "active",
    demo_data: true,
    timestamp: new Date().toISOString()
  });
});

// API info
app.get("/api", (req, res) => {
  res.json({
    success: true,
    name: "Butter Clover Integration",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth_url: "/auth/url",
      exchange_token: "POST /auth/token",
      list_tokens: "/auth/tokens",
      merchant_info: "/auth/real-merchant",
      dashboards: {
        main: "/dashboard.html",
        butter: "/index.html",
        shift_manager: "/shift-manager.html",
        mosque_donation: "/omar-mosque-donation.html"
      }
    },
    clover_config: {
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      site_url: SITE_URL
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
    }
  });
});

<<<<<<< HEAD
// Handle 404 - Page not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    requested_url: req.originalUrl,
    available_endpoints: [
      "/",
      "/health",
      "/api",
      "/auth/url",
      "/auth/token",
      "/auth/tokens",
      "/auth/real-merchant",
      "/callback"
    ]
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🎉 BUTTER CLOVER INTEGRATION v2.0
================================
🌐 Server running on port: ${PORT}
🔑 Client ID: ${CLIENT_ID}
🔗 Redirect URI: ${REDIRECT_URI}
🏠 Site URL: ${SITE_URL}
📊 Dashboard: ${SITE_URL}/index.html
🏥 Health: ${SITE_URL}/health
🔧 API: ${SITE_URL}/api
================================
✅ Ready for OAuth authorization!
================================
=======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🚀 BUTTER CLOVER INTEGRATION STARTED
====================================
Port: ${PORT}
Client ID: ${CLIENT_ID}
Redirect URI: ${REDIRECT_URI}
Site URL: ${SITE_URL}
====================================
>>>>>>> ef6661a16c76a6b6037674a6d465afd9a9e0d4a1
  `);
});

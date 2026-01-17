require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Clover Configuration
const CLIENT_ID = process.env.CLIENT_ID || "JD06DKTZ0E7MT";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "fd9a48ba-4357-c812-9558-62c27b182680";
const REDIRECT_URI = process.env.REDIRECT_URI || "https://myserver-wk8h.onrender.com/callback";
const SITE_URL = process.env.SITE_URL || "https://myserver-wk8h.onrender.com";

// In-memory store
const tokenStore = {};

// Routes
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "Butter Clover Integration",
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
    ]
  });
});

// Generate OAuth URL
app.get("/auth/url", (req, res) => {
  const authUrl = `https://www.clover.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
  
  res.json({
    success: true,
    auth_url: authUrl,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI
  });
});

// OAuth Callback
app.get("/callback", (req, res) => {
  console.log("✅ OAuth Callback Received:", req.query);
  
  const { code, merchant_id, error } = req.query;
  
  if (error) {
    return res.redirect(`/index.html?error=${encodeURIComponent(error)}`);
  }
  
  if (code && merchant_id) {
    tokenStore[merchant_id] = {
      code,
      timestamp: new Date().toISOString()
    };
    
    return res.redirect(`/index.html?code=${code}&merchant_id=${merchant_id}`);
  }
  
  res.redirect("/index.html?error=missing_params");
});

// Exchange code for token
app.post("/auth/token", async (req, res) => {
  try {
    const { code, merchant_id } = req.body;
    
    if (!code || !merchant_id) {
      return res.json({
        success: false,
        error: "Missing code or merchant_id"
      });
    }
    
    // Simulate token exchange (replace with real API call)
    const mockToken = `mock_token_${Date.now()}_${merchant_id}`;
    
    tokenStore[merchant_id] = {
      ...tokenStore[merchant_id],
      access_token: mockToken,
      expires_in: 86400,
      token_obtained: new Date().toISOString()
    };
    
    res.json({
      success: true,
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
    });
  }
});

// Get stored tokens
app.get("/auth/tokens", (req, res) => {
  const merchants = Object.keys(tokenStore);
  
  res.json({
    success: true,
    count: merchants.length,
    merchants,
    tokens: tokenStore,
    timestamp: new Date().toISOString()
  });
});

// Get merchant info
app.get("/auth/real-merchant", (req, res) => {
  res.json({
    success: true,
    merchant_id: "Q82R0D2NSRR81",
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
    }
  });
});

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
  `);
});

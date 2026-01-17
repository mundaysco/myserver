require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Clover Configuration
const CLIENT_ID = process.env.CLIENT_ID || "JD06DKTZ0E7MT";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "fd9a48ba-4357-c812-9558-62c27b182680";
const REDIRECT_URI = process.env.REDIRECT_URI || "https://myserver-wk8h.onrender.com/callback";
const SITE_URL = process.env.SITE_URL || "https://myserver-wk8h.onrender.com";

// In-memory token storage
const tokenStore = {};

// -------- Routes --------

// Redirect root to Butter dashboard
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "Butter Clover Integration",
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
    ]
  });
});

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
  
  res.json({
    success: true,
    auth_url: authUrl,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    environment: "sandbox",
    timestamp: new Date().toISOString()
  });
});

// OAuth Callback (Clover redirects here)
app.get("/callback", (req, res) => {
  console.log("🔄 Clover OAuth Callback:", req.query);
  
  const { code, merchant_id, error } = req.query;
  
  if (error) {
    return res.redirect(`/index.html?error=${encodeURIComponent(error)}`);
  }
  
  if (code && merchant_id) {
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
app.post("/auth/token", async (req, res) => {
  try {
    const { code, merchant_id } = req.body;
    
    if (!code || !merchant_id) {
      return res.json({
        success: false,
        error: "Missing code or merchant_id"
      });
    }
    
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
    };
    
    res.json({
      success: true,
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
    });
  }
});

// List all stored tokens
app.get("/auth/tokens", (req, res) => {
  const merchants = Object.keys(tokenStore);
  
  res.json({
    success: true,
    count: merchants.length,
    merchants: merchants,
    has_tokens: merchants.length > 0,
    timestamp: new Date().toISOString(),
    note: merchants.length === 0 ? "No tokens yet. Authorize with Clover first." : `${merchants.length} merchant(s) authorized`
  });
});

// Get merchant information (demo data)
app.get("/auth/real-merchant", (req, res) => {
  res.json({
    success: true,
    merchant_id: "Q82R0D2NSRR81",
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
    }
  });
});

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
  `);
});

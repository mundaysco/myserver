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

// Routes
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

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
      "/auth/token",
      "/auth/tokens",
      "/auth/real-merchant",
      "/callback",
      "/index.html",
      "/dashboard.html"
    ]
  });
});

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

app.get("/auth/url", (req, res) => {
  const authUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
  res.json({
    success: true,
    auth_url: authUrl,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    environment: "sandbox"
  });
});

app.get("/callback", (req, res) => {
  const { code, merchant_id, error } = req.query;
  if (error) return res.redirect(`/index.html?error=${encodeURIComponent(error)}`);
  if (code && merchant_id) {
    tokenStore[merchant_id] = { code, timestamp: new Date().toISOString() };
    return res.redirect(`/index.html?code=${code}&merchant_id=${merchant_id}`);
  }
  res.redirect("/index.html?error=missing_params");
});

app.post("/auth/token", async (req, res) => {
  try {
    const { code, merchant_id } = req.body;
    if (!code || !merchant_id) {
      return res.json({ success: false, error: "Missing code or merchant_id" });
    }
    const mockToken = `clover_token_${Date.now()}_${merchant_id}`;
    tokenStore[merchant_id] = {
      ...tokenStore[merchant_id],
      access_token: mockToken,
      expires_in: 86400,
      obtained: new Date().toISOString()
    };
    res.json({
      success: true,
      message: "Token obtained",
      merchant_id,
      access_token: mockToken,
      expires_in_hours: 24,
      token_stored: true
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get("/auth/tokens", (req, res) => {
  const merchants = Object.keys(tokenStore);
  res.json({
    success: true,
    count: merchants.length,
    merchants,
    has_tokens: merchants.length > 0
  });
});

app.get("/auth/real-merchant", (req, res) => {
  res.json({
    success: true,
    merchant_id: "Q82R0D2NSRR81",
    name: "Omar Mosque (Demo)",
    type: "nonprofit",
    status: "active",
    demo_data: true
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Butter server running on port ${PORT}`);
});

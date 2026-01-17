require("dotenv").config();
const express = require("express");
const app = express();

// Serve static files
app.use(express.static("public"));
app.use(express.json());

// Config
const CLIENT_ID = process.env.CLIENT_ID || "JD06DKTZ0E7MT";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "fd9a48ba-4357-c812-9558-62c27b182680";
const REDIRECT_URI = process.env.REDIRECT_URI || "https://myserver-wk8h.onrender.com/callback";

// Simple token storage
const tokenStore = {};

// Routes
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Butter Dashboard",
    version: "1.0",
    endpoints: ["/", "/health", "/auth/url", "/auth/token", "/callback"]
  });
});

app.get("/auth/url", (req, res) => {
  const authUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
  res.json({ success: true, auth_url: authUrl });
});

app.get("/callback", (req, res) => {
  const { code, merchant_id } = req.query;
  if (code && merchant_id) {
    // Store the code
    tokenStore[merchant_id] = { code, timestamp: new Date().toISOString() };
    res.redirect(`/index.html?code=${code}&merchant_id=${merchant_id}`);
  } else {
    res.redirect("/index.html?error=no_code");
  }
});

// Token exchange endpoint
app.post("/auth/token", (req, res) => {
  try {
    const { code, merchant_id } = req.body;
    
    if (!code || !merchant_id) {
      return res.json({
        success: false,
        error: "Missing code or merchant_id"
      });
    }
    
    // Create a mock token
    const mockToken = `clover_sandbox_${Date.now()}_${merchant_id}`;
    
    // Update storage
    tokenStore[merchant_id] = {
      ...tokenStore[merchant_id],
      access_token: mockToken,
      expires_in: 86400,
      token_type: "bearer",
      obtained: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: "Access token obtained successfully",
      merchant_id,
      access_token: mockToken,
      token_type: "bearer",
      expires_in: 86400,
      expires_in_hours: 24,
      demo_note: "Demo token - Real app would exchange with Clover API"
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Check tokens endpoint
app.get("/auth/tokens", (req, res) => {
  const merchants = Object.keys(tokenStore);
  res.json({
    success: true,
    count: merchants.length,
    merchants,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Butter server running on port ${PORT}`);
  console.log(`🔗 OAuth URL: /auth/url`);
  console.log(`🔄 Token exchange: POST /auth/token`);
  console.log(`📋 Token list: GET /auth/tokens`);
});

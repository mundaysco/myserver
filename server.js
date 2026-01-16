require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_ID = process.env.CLOVER_APP_ID;
const APP_SECRET = process.env.CLOVER_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SITE_URL = process.env.SITE_URL;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ========== API ENDPOINTS ==========

// API Root
app.get("/api", (req, res) => {
  res.json({
    service: "Max Clover API",
    version: "1.0.0",
    environment: NODE_ENV,
    endpoints: {
      root: "GET /api",
      health: "GET /api/health",
      auth: "GET /api/auth",
      callback: "GET /api/callback",
      exchange: "POST /api/exchange"
    }
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Max Clover Server",
    environment: NODE_ENV,
    port: PORT
  });
});

// Generate Auth URL
app.get("/api/auth", (req, res) => {
  if (!APP_ID || !REDIRECT_URI) {
    return res.status(400).json({
      error: "Missing configuration",
      message: "CLOVER_APP_ID or REDIRECT_URI not set"
    });
  }
  
  const authUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
  
  res.json({
    message: "Redirect to Clover OAuth",
    auth_url: authUrl,
    redirect: true
  });
});

// OAuth Callback
app.get("/api/callback", async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.status(400).json({
      error: "Authorization Failed",
      details: error,
      timestamp: new Date().toISOString()
    });
  }
  
  if (!code) {
    return res.status(400).json({
      error: "Missing Authorization Code",
      message: "No code parameter found"
    });
  }
  
  console.log(`Received authorization code: ${code.substring(0, 20)}...`);
  
  try {
    const response = await axios.post(
      "https://apisandbox.dev.clover.com/oauth/v2/token",
      new URLSearchParams({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    
    const { access_token, merchant_id, expires_in } = response.data;
    
    console.log(`Token exchange successful for merchant: ${merchant_id}`);
    
    res.json({
      success: true,
      message: "Clover OAuth Successful",
      merchant_id: merchant_id,
      access_token: access_token ? `${access_token.substring(0, 20)}...` : null,
      token_type: "bearer",
      expires_in: expires_in,
      expires_in_hours: Math.floor(expires_in / 3600),
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("Token exchange failed:", err.response?.data || err.message);
    
    res.status(500).json({
      success: false,
      error: "Token Exchange Failed",
      details: err.response?.data || err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Token Exchange Endpoint
app.post("/api/exchange", async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Missing authorization code"
      });
    }
    
    console.log("Exchanging code:", code.substring(0, 20) + "...");
    
    const response = await axios.post(
      "https://apisandbox.dev.clover.com/oauth/v2/token",
      new URLSearchParams({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    
    console.log("Token received");
    res.json({ success: true, ...response.data });
    
  } catch (error) {
    console.error("Exchange failed:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Exchange failed",
      details: error.response?.data || error.message
    });
  }
});

// ========== HTML DASHBOARD ==========

// Root HTML page
app.get("/", (req, res) => {
  const { code } = req.query;
  
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Max Clover App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
      .box { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 10px; }
      .btn { background: blue; color: white; padding: 10px 20px; border: none; cursor: pointer; margin: 5px; }
      .success { background: #d4edda; border-left: 4px solid #28a745; }
      .error { background: #f8d7da; border-left: 4px solid #dc3545; }
    </style>
  </head>
  <body>
    <h1>Max Clover App</h1>
    <div class="box">
      <h3>Server Status</h3>
      <p><strong>Environment:</strong> ${NODE_ENV}</p>
      <p><strong>App ID:</strong> ${APP_ID || "Not set"}</p>
      <p><strong>App Secret:</strong> ${APP_SECRET ? "Set" : "Missing"}</p>
      <p><strong>Redirect URI:</strong> ${REDIRECT_URI || "Not set"}</p>
  `;
  
  if (code) {
    html += `
      <div class="box success">
        <h3>Authorization Code Received!</h3>
        <p>Code: ${code.substring(0, 30)}...</p>
        <button class="btn" onclick="exchangeToken()">Get Access Token</button>
        <div id="result"></div>
        <script>
          async function exchangeToken() {
            const res = await fetch("/api/exchange", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({code: "${code}"})
            });
            const data = await res.json();
            document.getElementById("result").innerHTML = 
              data.success ? 
                "<p>Success! Token: " + (data.access_token || "").substring(0, 30) + "...</p>" : 
                "<p>Error: " + data.error + "</p>";
          }
        </script>
      </div>
    `;
  } else {
    html += `
      <div class="box">
        <h3>Start OAuth Flow</h3>
        <a href="/api/auth" class="btn">Get Authorization URL</a>
        <a href="/api" class="btn">View API</a>
      </div>
      
      <div class="box">
        <h3>Setup Instructions</h3>
        <ol>
          <li>Click "Get Authorization URL"</li>
          <li>Authorize in Clover Sandbox</li>
          <li>Exchange code for access token</li>
        </ol>
      </div>
    `;
  }
  
  html += `
    </div>
  </body>
  </html>
  `;
  
  res.send(html);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send(`
    <html><body style="font-family: Arial; padding: 40px;">
      <h1>404 - Not Found</h1>
      <p>The requested URL ${req.url} was not found.</p>
      <a href="/">Go to Home</a>
    </body></html>
  `);
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log("=== MAX CLOVER APP ===");
  console.log("App ID:", APP_ID);
  console.log("App Secret:", APP_SECRET ? "Set" : "Missing");
  console.log("Redirect URI:", REDIRECT_URI);
  console.log("Environment:", NODE_ENV);
  console.log("======================");
  console.log(`Server running on port ${PORT}`);
  
  if (NODE_ENV === "production") {
    console.log(`Production: https://myserver-wk8h.onrender.com`);
  }
});

require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ YOUR CREDENTIALS
const CLOVER_APP_ID = "JD06DKTZ0E7MT";
const CLOVER_APP_SECRET = "fd9a48ba-4357-c812-9558-62c27b182680";
const RENDER_URL = "https://myserver-wk8h.onrender.com";
const REDIRECT_URI = RENDER_URL + "/oauth/callback";

// Store tokens in memory
let activeTokens = {};

console.log("🚀 Professional Clover Dashboard");
console.log("✅ URL:", RENDER_URL);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ========== ROUTES ==========

// 1. MAIN DASHBOARD
app.get("/", (req, res) => {
  const merchantCount = Object.keys(activeTokens).length;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🍀 Clover Dashboard Pro</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
        .logo { font-size: 2.5em; color: #6ABD45; margin-bottom: 10px; }
        .tagline { color: #666; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: white; border-radius: 15px; padding: 25px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-left: 5px solid #6ABD45; }
        .stat-icon { font-size: 2em; color: #6ABD45; margin-bottom: 10px; }
        .stat-number { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
        .action-card { background: white; border-radius: 15px; padding: 30px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05); transition: transform 0.3s; }
        .action-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .action-icon { font-size: 3em; color: #6ABD45; margin-bottom: 20px; }
        .action-btn { background: #6ABD45; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 15px; text-decoration: none; display: inline-block; }
        .action-btn:hover { background: #5AA535; }
        .nav { display: flex; gap: 15px; margin-top: 30px; flex-wrap: wrap; justify-content: center; }
        .nav a { color: #6ABD45; text-decoration: none; padding: 8px 15px; border-radius: 5px; }
        .nav a:hover { background: rgba(106, 189, 69, 0.1); }
        .debug-info { background: #f8f9fa; border-radius: 10px; padding: 20px; margin-top: 30px; font-family: monospace; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍀 Clover Dashboard Pro</div>
          <p class="tagline">Complete Merchant Management Platform</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-store"></i></div>
              <div class="stat-number">${merchantCount}</div>
              <div class="stat-label">Connected Merchants</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
              <div class="stat-number">${CLOVER_APP_ID ? "✅" : "❌"}</div>
              <div class="stat-label">App Status</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-link"></i></div>
              <div class="stat-number">${RENDER_URL ? "✅" : "❌"}</div>
              <div class="stat-label">Server Online</div>
            </div>
          </div>
          
          <div class="action-grid">
            <div class="action-card">
              <div class="action-icon"><i class="fas fa-plug"></i></div>
              <h3>Connect Merchant</h3>
              <p>Connect a new Clover merchant account to access orders, payments, and inventory.</p>
              <a href="/auth/clover" class="action-btn"><i class="fas fa-sign-in-alt"></i> Connect Clover Account</a>
            </div>
            
            <div class="action-card">
              <div class="action-icon"><i class="fas fa-list"></i></div>
              <h3>View Orders</h3>
              <p>Browse recent orders, process refunds, and manage customer transactions.</p>
              <a href="/orders" class="action-btn"><i class="fas fa-shopping-cart"></i> View Orders</a>
            </div>
            
            <div class="action-card">
              <div class="action-icon"><i class="fas fa-chart-bar"></i></div>
              <h3>Analytics</h3>
              <p>Get insights into sales performance, customer behavior, and revenue trends.</p>
              <a href="/analytics" class="action-btn"><i class="fas fa-chart-line"></i> View Analytics</a>
            </div>
          </div>
          
          <div class="nav">
            <a href="/"><i class="fas fa-home"></i> Dashboard</a>
            <a href="/merchants"><i class="fas fa-store"></i> Merchants</a>
            <a href="/orders"><i class="fas fa-shopping-cart"></i> Orders</a>
            <a href="/payments"><i class="fas fa-credit-card"></i> Payments</a>
            <a href="/inventory"><i class="fas fa-boxes"></i> Inventory</a>
            <a href="/settings"><i class="fas fa-cog"></i> Settings</a>
            <a href="/debug"><i class="fas fa-bug"></i> Debug</a>
          </div>
        </div>
        
        <div class="debug-info">
          <h4><i class="fas fa-info-circle"></i> System Information</h4>
          <p><strong>Server URL:</strong> ${RENDER_URL}</p>
          <p><strong>App ID:</strong> ${CLOVER_APP_ID}</p>
          <p><strong>Merchants Connected:</strong> ${merchantCount}</p>
          <p><strong>Redirect URI:</strong> ${REDIRECT_URI}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 2. START OAUTH
app.get("/auth/clover", (req, res) => {
  const authUrl = "https://www.clover.com/oauth/authorize?client_id=" + CLOVER_APP_ID + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) + "&response_type=code";
  console.log("🔗 OAuth URL:", authUrl);
  res.redirect(authUrl);
});

// 3. OAUTH CALLBACK
app.get("/oauth/callback", async (req, res) => {
  const { code, merchant_id, employee_id, client_id } = req.query;
  
  console.log("📞 Callback received:", { merchant_id, client_id });
  
  if (!code) {
    return res.send("<h1>❌ No authorization code received</h1>");
  }
  
  try {
    console.log("🔄 Exchanging code for token...");
    
    const response = await axios.post("https://api.clover.com/oauth/token", null, {
      params: {
        client_id: CLOVER_APP_ID,
        client_secret: CLOVER_APP_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI
      }
    });
    
    const { access_token, merchant_id: mid } = response.data;
    
    // Store token
    activeTokens[mid] = {
      token: access_token,
      merchant_id: mid,
      connected_at: new Date().toISOString(),
      employee_id: employee_id
    };
    
    console.log("✅ Token stored for merchant:", mid);
    
    // SUCCESS PAGE
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>✅ Connected Successfully!</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; text-align: center; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
          .success-card { background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .success-icon { font-size: 4em; color: #6ABD45; margin-bottom: 20px; }
          .token-display { background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0; font-family: monospace; word-break: break-all; }
          .action-btns { display: flex; gap: 15px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }
          .btn { background: #6ABD45; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; display: inline-block; }
          .btn:hover { background: #5AA535; }
        </style>
      </head>
      <body>
        <div class="success-card">
          <div class="success-icon">✅</div>
          <h1>🎉 Clover Connected Successfully!</h1>
          <p>Your merchant account is now connected and ready to use.</p>
          
          <div style="text-align: left; margin: 30px 0;">
            <p><strong>Merchant ID:</strong> ${mid}</p>
            <p><strong>Employee ID:</strong> ${employee_id || 'N/A'}</p>
            <p><strong>Connected At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p><strong>Access Token:</strong></p>
          <div class="token-display">${access_token.substring(0, 50)}...</div>
          
          <div class="action-btns">
            <a href="/" class="btn"><i class="fas fa-home"></i> Go to Dashboard</a>
            <a href="/merchants" class="btn"><i class="fas fa-store"></i> View Merchants</a>
            <a href="/orders?merchant_id=${mid}" class="btn"><i class="fas fa-shopping-cart"></i> View Orders</a>
          </div>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error("❌ Token exchange failed:", error.message);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>❌ Connection Failed</title></head>
      <body style="padding:40px;font-family:Arial;text-align:center;">
        <h1 style="color:red;">❌ Connection Failed</h1>
        <p>${error.message}</p>
        <pre style="text-align:left;background:#f5f5f5;padding:15px;border-radius:5px;">${JSON.stringify(error.response?.data, null, 2) || 'No details'}</pre>
        <a href="/" style="color:#6ABD45;">Back to Dashboard</a>
      </body>
      </html>
    `);
  }
});

// 4. MERCHANTS PAGE
app.get("/merchants", (req, res) => {
  const merchants = Object.values(activeTokens);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Connected Merchants</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f7fa; }
        .container { max-width: 1000px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .merchant-card { background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 3px 10px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
        .merchant-id { font-family: monospace; background: #f8f9fa; padding: 5px 10px; border-radius: 5px; }
        .btn { background: #6ABD45; color: white; padding: 8px 15px; border-radius: 5px; text-decoration: none; font-size: 14px; }
        .empty-state { text-align: center; padding: 60px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><i class="fas fa-store"></i> Connected Merchants</h1>
          <p>Manage your connected Clover merchant accounts</p>
        </div>
        
        ${merchants.length === 0 ? `
          <div class="empty-state">
            <div style="font-size: 4em; color: #ccc; margin-bottom: 20px;"><i class="fas fa-store-slash"></i></div>
            <h2>No Merchants Connected</h2>
            <p>Connect your first Clover merchant to get started.</p>
            <a href="/auth/clover" class="btn" style="margin-top: 20px;"><i class="fas fa-plug"></i> Connect Merchant</a>
          </div>
        ` : `
          ${merchants.map(merchant => `
            <div class="merchant-card">
              <div>
                <h3><i class="fas fa-store"></i> Merchant ${merchant.merchant_id.substring(0, 8)}...</h3>
                <p><small>Connected: ${new Date(merchant.connected_at).toLocaleString()}</small></p>
              </div>
              <div>
                <span class="merchant-id">${merchant.merchant_id}</span>
                <a href="/orders?merchant_id=${merchant.merchant_id}" class="btn"><i class="fas fa-shopping-cart"></i> View Orders</a>
              </div>
            </div>
          `).join('')}
        `}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="/" style="color: #6ABD45; text-decoration: none;"><i class="fas fa-arrow-left"></i> Back to Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 5. ORDERS PAGE
app.get("/orders", async (req, res) => {
  const merchantId = req.query.merchant_id;
  let orders = [];
  
  if (merchantId && activeTokens[merchantId]) {
    try {
      const response = await axios.get("https://api.clover.com/v3/merchants/" + merchantId + "/orders", {
        headers: { Authorization: "Bearer " + activeTokens[merchantId].token }
      });
      orders = response.data.elements || [];
    } catch (error) {
      console.error("Failed to fetch orders:", error.message);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Orders</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .order-card { background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 3px 10px rgba(0,0,0,0.05); }
        .order-id { font-family: monospace; color: #666; }
        .amount { font-weight: bold; color: #6ABD45; }
        .empty-state { text-align: center; padding: 60px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><i class="fas fa-shopping-cart"></i> Orders</h1>
          <p>View and manage merchant orders</p>
          ${merchantId ? `<p><small>Merchant: ${merchantId}</small></p>` : ''}
        </div>
        
        ${orders.length === 0 ? `
          <div class="empty-state">
            <div style="font-size: 4em; color: #ccc; margin-bottom: 20px;"><i class="fas fa-shopping-cart"></i></div>
            <h2>No Orders Found</h2>
            <p>${merchantId ? 'This merchant has no orders yet.' : 'Select a merchant to view orders.'}</p>
            <a href="/merchants" class="btn" style="background:#6ABD45;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;margin-top:20px;">
              <i class="fas fa-store"></i> View Merchants
            </a>
          </div>
        ` : `
          ${orders.map(order => `
            <div class="order-card">
              <h3>Order #${order.id || 'N/A'}</h3>
              <p>Total: <span class="amount">$${(order.total || 0) / 100}</span></p>
              <p><small>Created: ${new Date(order.createdTime || Date.now()).toLocaleString()}</small></p>
            </div>
          `).join('')}
        `}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="/" style="color: #6ABD45; text-decoration: none;"><i class="fas fa-arrow-left"></i> Back to Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 6. DEBUG PAGE
app.get("/debug", (req, res) => {
  res.json({
    server: {
      url: RENDER_URL,
      port: PORT,
      environment: process.env.NODE_ENV || "development"
    },
    clover: {
      app_id: CLOVER_APP_ID,
      redirect_uri: REDIRECT_URI,
      active_merchants: Object.keys(activeTokens).length
    },
    tokens: activeTokens,
    timestamp: new Date().toISOString()
  });
});

// 7. HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    merchants: Object.keys(activeTokens).length
  });
});

// Start server
app.listen(PORT, () => {
  console.log("✅ Professional Dashboard running on port", PORT);
  console.log("✅ Open:", RENDER_URL);
  console.log("✅ Health check:", RENDER_URL + "/health");
  console.log("✅ Debug info:", RENDER_URL + "/debug");
});

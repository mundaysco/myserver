const express = require('express');
const router = express.Router();
const path = require('path');
const { exchangeCodeForToken, getToken } = require('../utils/cloverOAuth');

// Dashboard Hub with OAuth handling
router.get("/", async (req, res) => {
  const { merchant_id, code, employee_id, client_id } = req.query;
  
  console.log("📱 Dashboard hub accessed with:", { merchant_id, hasCode: !!code });
  
  // If we have a code, exchange it for token first
  if (code && merchant_id) {
    try {
      console.log("🔄 Processing OAuth code exchange...");
      await exchangeCodeForToken(merchant_id, code);
      
      // Redirect to same page without code (to avoid code reuse)
      return res.redirect(`/clover?merchant_id=${merchant_id}`);
      
    } catch (error) {
      console.error("❌ OAuth error:", error);
      
      // Still show dashboard but with error
      const html = \`
      <!DOCTYPE html>
      <html>
      <head><title>OAuth Error</title></head>
      <body>
        <h2>OAuth Error</h2>
        <p>Failed to authenticate: ${error.message}</p>
        <p><a href="/clover?merchant_id=${merchant_id}">Continue to Dashboard</a></p>
      </body>
      </html>
      \`;
      return res.send(html);
    }
  }
  
  // Check if we have a valid token
  let hasValidToken = false;
  if (merchant_id) {
    const tokenData = await getToken(merchant_id);
    hasValidToken = !!tokenData;
  }
  
  // Main dashboard hub
  const html = \`
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Hub</title>
    <style>
        body { font-family: Arial; padding: 40px; background: #f0f2f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-left: 10px;
        }
        .status-connected { background: #d4edda; color: #155724; }
        .status-disconnected { background: #f8d7da; color: #721c24; }
        
        .dashboard-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-top: 30px; 
        }
        .dashboard-card { 
            background: white; 
            padding: 25px; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            transition: transform 0.3s; 
            text-decoration: none; 
            color: #333; 
            display: block; 
        }
        .dashboard-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 6px 12px rgba(0,0,0,0.15); 
        }
        .dashboard-card h3 { 
            color: #2c3e50; 
            margin-top: 0; 
            display: flex; 
            align-items: center; 
        }
        .dashboard-card .icon { 
            font-size: 24px; 
            margin-right: 10px; 
        }
        .sales { border-left: 5px solid #e74c3c; }
        .analytics { border-left: 5px solid #2ecc71; }
        .simple { border-left: 5px solid #f39c12; }
        .butter { border-left: 5px solid #FF6B35; }
        .donations { border-left: 5px solid #9b59b6; }
        
        .auth-info {
            background: #fff8e1;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Dashboard Hub</h1>
        
        <div class="auth-info">
            <h3>🔑 Authentication Status</h3>
            <p>Merchant ID: <code>${merchant_id || 'Not set'}</code></p>
            <p>Token Status: 
                <span class="status-badge ${hasValidToken ? 'status-connected' : 'status-disconnected'}">
                    ${hasValidToken ? '✅ Connected to Clover' : '❌ Not authenticated'}
                </span>
            </p>
            ${!hasValidToken && merchant_id ? 
                '<p><strong>Action needed:</strong> Launch this app from Clover Sandbox to authenticate.</p>' : 
                ''}
        </div>
        
        <div class="dashboard-grid">
            <a href="/clover/sales?merchant_id=${merchant_id || ''}" class="dashboard-card sales">
                <h3><span class="icon">📈</span> Sales Dashboard</h3>
                <p>View sales data and analytics</p>
                ${hasValidToken ? '<small style="color: #2ECC71;">✅ Live data</small>' : '<small style="color: #999;">⚡ Requires auth</small>'}
            </a>
            
            <a href="/clover/analytics?merchant_id=${merchant_id || ''}" class="dashboard-card analytics">
                <h3><span class="icon">📊</span> Analytics Dashboard</h3>
                <p>Detailed analytics and reporting</p>
                ${hasValidToken ? '<small style="color: #2ECC71;">✅ Live data</small>' : '<small style="color: #999;">⚡ Requires auth</small>'}
            </a>
            
            <a href="/clover/butter?merchant_id=${merchant_id || ''}" class="dashboard-card butter">
                <h3><span class="icon">🧈</span> Butter Dashboard</h3>
                <p>Advanced analytics & management</p>
                ${hasValidToken ? '<small style="color: #2ECC71;">✅ Live data</small>' : '<small style="color: #999;">⚡ Requires auth</small>'}
            </a>
            
            <a href="/donations?merchant_id=${merchant_id || ''}" class="dashboard-card donations">
                <h3><span class="icon">🕌</span> Donations Dashboard</h3>
                <p>Omar Mosque donation tracking</p>
            </a>
            
            <a href="/clover/simple?merchant_id=${merchant_id || ''}" class="dashboard-card simple">
                <h3><span class="icon">🔄</span> Simple Dashboard</h3>
                <p>Basic dashboard view</p>
            </a>
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 10px; border-left: 5px solid #3498db;">
            <h3>📋 How to Use</h3>
            <ol>
                <li>Go to <a href="https://sandbox.dev.clover.com" target="_blank">Clover Sandbox</a></li>
                <li>Login as a merchant (not developer)</li>
                <li>Go to Apps → Your Apps → Click this app</li>
                <li>That's it! You'll be automatically authenticated.</li>
            </ol>
        </div>
    </div>
</body>
</html>
  \`;
  
  res.send(html);
});

// Serve dashboard HTML files
router.get("/sales", (req, res) => {
  res.sendFile(path.join(__dirname, "../clover-dashboard-fixed.html"));
});

router.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard.html"));
});

router.get("/simple", (req, res) => {
  res.sendFile(path.join(__dirname, "../clover-simple.html"));
});

router.get("/butter", (req, res) => {
  res.sendFile(path.join(__dirname, "../butter-dashboard-real.html"));
});

module.exports = router;

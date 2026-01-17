const express = require('express');
const router = express.Router();
const path = require('path');

// Dashboard Hub
router.get("/", (req, res) => {
  const { merchant_id, code, employee_id, client_id } = req.query;
  
  // If we have a code, exchange for token first
  if (code && merchant_id) {
    const html = \`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Processing OAuth...</title>
        <script>
            // Store merchant_id in localStorage
            localStorage.setItem('clover_merchant_id', '${merchant_id}');
            // Redirect to dashboard hub
            window.location.href = '/clover?merchant_id=${merchant_id}';
        </script>
    </head>
    <body>
        <h2>Processing authentication...</h2>
    </body>
    </html>
    \`;
    return res.send(html);
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
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Dashboard Hub</h1>
        <p>Merchant ID: <code>${merchant_id || 'Not authenticated'}</code></p>
        
        <div class="dashboard-grid">
            <a href="/clover/sales?merchant_id=${merchant_id || ''}" class="dashboard-card sales">
                <h3><span class="icon">📈</span> Sales Dashboard</h3>
                <p>View sales data and analytics</p>
            </a>
            
            <a href="/clover/analytics?merchant_id=${merchant_id || ''}" class="dashboard-card analytics">
                <h3><span class="icon">📊</span> Analytics Dashboard</h3>
                <p>Detailed analytics and reporting</p>
            </a>
            
            <a href="/clover/simple?merchant_id=${merchant_id || ''}" class="dashboard-card simple">
                <h3><span class="icon">🔄</span> Simple Dashboard</h3>
                <p>Basic dashboard view</p>
            </a>
            
            <a href="/clover/butter?merchant_id=${merchant_id || ''}" class="dashboard-card butter">
                <h3><span class="icon">🧈</span> Butter Dashboard</h3>
                <p>Advanced analytics & management</p>
            </a>
            
            <a href="/donations?merchant_id=${merchant_id || ''}" class="dashboard-card donations">
                <h3><span class="icon">🕌</span> Donations Dashboard</h3>
                <p>Omar Mosque donation tracking</p>
            </a>
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: #fff8e1; border-radius: 10px;">
            <h3>🔑 Authentication Status</h3>
            <p>Merchant ID: <strong>${merchant_id || 'Not set'}</strong></p>
            <p>To re-authenticate: Go to Clover Sandbox → Apps → Your App</p>
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

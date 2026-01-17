const express = require("express");
const router = express.Router();
const path = require("path");

// Dashboard Hub
router.get("/", (req, res) => {
  const { merchant_id } = req.query;
  
  const html = `
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
        .donations { border-left: 5px solid #9b59b6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Clover Dashboard Hub</h1>
        <p>Select a dashboard to view:</p>
        
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
            
            <a href="/clover/butter?merchant_id=${merchant_id || ''}" class="dashboard-card" style="border-left: 5px solid #FF6B35;">
                <h3><span class="icon">🧈</span> Butter Dashboard</h3>
                <p>Advanced analytics & management</p>
            </a>
            
            <a href="/donations?merchant_id=${merchant_id || ''}" class="dashboard-card donations">
                <h3><span class="icon">🕌</span> Donations Dashboard</h3>
                <p>Omar Mosque donation tracking</p>
            </a>
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: #fff8e1; border-radius: 10px;">
            <h3>🔑 OAuth Instructions</h3>
            <p>To authenticate with Clover:</p>
            <ol>
                <li>Go to <a href="https://sandbox.dev.clover.com" target="_blank">Clover Sandbox</a></li>
                <li>Login as a merchant (not developer)</li>
                <li>Go to Apps → Your Apps</li>
                <li>Click your app to launch</li>
            </ol>
        </div>
    </div>
</body>
</html>`;
  
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

// Butter Dashboard
router.get("/butter", (req, res) => {
  res.sendFile(path.join(__dirname, "../butter-dashboard.html"));
});

module.exports = router;



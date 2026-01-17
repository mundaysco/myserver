require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Import and use clover dashboard
const cloverDashboard = require("./routes/cloverDashboard");
app.use("/clover", cloverDashboard);

// Serve donation dashboard
app.get("/donations", (req, res) => {
  res.sendFile(path.join(__dirname, "../omar-mosque-donation.html"));
});

// Redirect root to dashboard hub
app.get("/", (req, res) => {
  res.redirect("/clover");
});

// Handle OAuth callback
app.get("/callback", (req, res) => {
  res.redirect("/auth/callback?merchant_id=" + (req.query.merchant_id || '') + "&code=" + (req.query.code || ''));
});

// HEALTH CHECK ENDPOINT FOR RENDER (CRITICAL)
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "max-clover-dashboards"
  });
});

// Simple JSON endpoint for Render checks
app.get("/api/status", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/clover/sales`);
  console.log(`   http://localhost:${PORT}/donations`);
  console.log(`   http://localhost:${PORT}/health (Render health check)`);
});

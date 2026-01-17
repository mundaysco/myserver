require("dotenv").config();
const express = require("express");
const app = express();

// Serve static files (dashboard, etc.)
app.use(express.static("public"));

// FIX: Redirect /callback to /auth/callback
app.get("/callback", (req, res) => {
  console.log("🔄 Redirecting Clover OAuth to Butter API");
  console.log("Received params:", req.query);
  
  // Preserve ALL OAuth parameters
  const params = new URLSearchParams(req.query);
  res.redirect(`/auth/callback?${params.toString()}`);
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Butter API Proxy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: ["/", "/dashboard.html", "/callback", "/health", "/auth/callback"],
    fix: "Redirects /callback → /auth/callback"
  });
});

// Root redirect to dashboard
app.get("/", (req, res) => {
  res.redirect("/dashboard.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🚀 BUTTER API PROXY STARTED
==========================
Port: ${PORT}
Fix: /callback → /auth/callback
Dashboard: /dashboard.html
Health: /health
==========================
  `);
});

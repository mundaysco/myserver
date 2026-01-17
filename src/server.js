require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Check if routes exist before requiring
let cloverDashboard;
try {
  cloverDashboard = require("./routes/cloverDashboard");
} catch (err) {
  console.log("Creating basic cloverDashboard...");
  // Create a basic router if file doesn't exist
  const express = require("express");
  cloverDashboard = express.Router();
  cloverDashboard.get("/", (req, res) => {
    res.send("<h1>Clover Dashboard Hub</h1><p>Basic dashboard - routes file will be created automatically.</p>");
  });
}

// Use the clover dashboard routes
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   http://localhost:${PORT}/              - Dashboard Hub`);
  console.log(`   http://localhost:${PORT}/clover/sales   - Sales Dashboard`);
  console.log(`   http://localhost:${PORT}/clover/analytics - Analytics`);
  console.log(`   http://localhost:${PORT}/clover/simple  - Simple Dashboard`);
  console.log(`   http://localhost:${PORT}/donations      - Donations`);
});

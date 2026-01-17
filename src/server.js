require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Import routes
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const cloverDashboard = require("./routes/cloverDashboard-fixed");
const butterApi = require("./routes/butterApi");

// Use routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/clover", cloverDashboard);
app.use("/api/butter", butterApi);

// Serve donation dashboard
app.get("/donations", (req, res) => {
  res.sendFile(path.join(__dirname, "../omar-mosque-donation.html"));
});

// Redirect root to clover dashboard hub
app.get("/", (req, res) => {
  const queryString = req.url.split("?")[1] || "";
  res.redirect("/clover?" + queryString);
});

// Handle OAuth callback
app.get("/callback", (req, res) => {
  res.redirect("/auth/callback?merchant_id=" + (req.query.merchant_id || '') + "&code=" + (req.query.code || ''));
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

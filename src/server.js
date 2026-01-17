require("dotenv").config();
const express = require("express");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Butter API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🧈 Butter App Server Started");
  console.log("============================");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Port: ${PORT}`);
  console.log(`Clover App ID: ${process.env.CLOVER_APP_ID ? "✅ Set" : "❌ Missing"}`);
  
  if (process.env.NODE_ENV === "production") {
    console.log(`Production URL: ${process.env.SITE_URL || "Not set"}`);
  }
});

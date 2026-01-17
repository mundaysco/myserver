require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Import routes with correct paths from root
let cloverDashboard;
try {
    cloverDashboard = require("./src/routes/cloverDashboard-fixed");
    console.log("✓ Loaded cloverDashboard-fixed");
} catch (err) {
    console.log("Creating basic cloverDashboard router");
    cloverDashboard = express.Router();
    cloverDashboard.get("/", (req, res) => {
        res.send("<h1>Dashboard Hub</h1><p>Welcome!</p>");
    });
}

let butterApi;
try {
    butterApi = require("./src/routes/butterApi");
    console.log("✓ Loaded butterApi");
} catch (err) {
    console.log("Creating basic butterApi router");
    butterApi = express.Router();
    butterApi.get("/stats", (req, res) => {
        res.json({ status: "Butter API not fully configured" });
    });
}

// Use routes
app.use("/clover", cloverDashboard);
app.use("/api/butter", butterApi);

// Serve donation dashboard
app.get("/donations", (req, res) => {
    res.sendFile(path.join(__dirname, "omar-mosque-donation.html"));
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

// Health check for Render
app.get("/health", (req, res) => {
    res.json({ status: "healthy", service: "max-clover" });
});

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
    console.log("📊 Main: http://localhost:" + PORT);
    console.log("🧈 Butter: http://localhost:" + PORT + "/clover/butter");
});

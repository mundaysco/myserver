require("dotenv").config();
const express = require("express");
const app = express();

// Serve static files
app.use(express.static("public"));
app.use(express.json());

// Config
const CLIENT_ID = process.env.CLIENT_ID || "JD06DKTZ0E7MT";
const REDIRECT_URI = process.env.REDIRECT_URI || "https://myserver-wk8h.onrender.com/callback";

// Routes
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Butter Dashboard",
    version: "1.0",
    endpoints: ["/", "/health", "/auth/url", "/callback"]
  });
});

app.get("/auth/url", (req, res) => {
  const authUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
  res.json({ success: true, auth_url: authUrl });
});

app.get("/callback", (req, res) => {
  const { code, merchant_id } = req.query;
  if (code && merchant_id) {
    res.redirect(`/index.html?code=${code}&merchant_id=${merchant_id}`);
  } else {
    res.redirect("/index.html?error=no_code");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Butter server running on port ${PORT}`);
});

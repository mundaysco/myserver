const express = require("express");
const axios = require("axios");
const router = express.Router();

const APP_ID = process.env.CLOVER_APP_ID;
const APP_SECRET = process.env.CLOVER_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Generate authorization URL
router.get("/url", (req, res) => {
  if (!APP_ID || !REDIRECT_URI) {
    return res.status(400).json({
      error: "Configuration missing",
      message: "CLOVER_APP_ID or REDIRECT_URI not set"
    });
  }

  const authUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
  
  res.json({
    success: true,
    auth_url: authUrl,
    message: "Use this URL to authorize with Clover"
  });
});

// OAuth callback handler
router.get("/callback", (req, res) => {
  const { code, merchant_id, error } = req.query;

  console.log("🧈 OAuth Callback Received");
  console.log("Code:", code ? code.substring(0, 15) + "..." : "None");
  console.log("Merchant ID:", merchant_id || "None");

  if (error) {
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    // Store code and merchant_id for frontend
    return res.redirect(`/?code=${code}&merchant_id=${merchant_id || ""}`);
  }

  res.redirect("/");
});

// Exchange code for token
router.post("/token", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Missing authorization code"
      });
    }

    console.log("🧈 Exchanging code for token:", code.substring(0, 15) + "...");

    const tokenUrl = "https://sandbox.dev.clover.com/oauth/token";
    
    const params = new URLSearchParams();
    params.append("client_id", APP_ID);
    params.append("client_secret", APP_SECRET);
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const { access_token, merchant_id, expires_in } = response.data;

    console.log("✅ Token exchange successful for merchant:", merchant_id);

    res.json({
      success: true,
      message: "Token exchange successful",
      merchant_id,
      access_token: access_token ? `${access_token.substring(0, 20)}...` : null,
      expires_in,
      expires_in_hours: Math.floor(expires_in / 3600),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Token exchange failed:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: "Token exchange failed",
      details: error.response?.data || error.message,
      troubleshooting: [
        "1. Authorization codes expire quickly - get a new one",
        "2. Verify environment variables are set correctly",
        "3. Check Clover app configuration"
      ]
    });
  }
});

module.exports = router;

const express = require("express");
const axios = require("axios");
const router = express.Router();

const APP_ID = process.env.CLOVER_APP_ID;
const APP_SECRET = process.env.CLOVER_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Import token storage
const TokenStorage = require("../utils/tokenStorage");

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
    const { code, merchant_id: incomingMerchantId } = req.body;

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

    const { access_token, merchant_id: tokenMerchantId, expires_in } = response.data;

    console.log("✅ Token exchange successful, access_token received");

    // Determine merchant_id: from token response, request body, or API call
    let finalMerchantId = tokenMerchantId || incomingMerchantId;
    
    // If still no merchant_id, try to get it from Clover API
    if (!finalMerchantId && access_token) {
      try {
        console.log("🔍 Fetching merchant info from Clover API...");
        const merchantResponse = await axios.get(`https://sandbox.dev.clover.com/v3/merchants/me`, {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        
        if (merchantResponse.data && merchantResponse.data.id) {
          finalMerchantId = merchantResponse.data.id;
          console.log(`✅ Found merchant_id from API: ${finalMerchantId}`);
        }
      } catch (apiError) {
        console.log("⚠️ Could not fetch merchant info:", apiError.message);
      }
    }

    // Save token securely
    if (finalMerchantId && access_token) {
      TokenStorage.saveToken(finalMerchantId, {
        access_token: access_token,
        expires_in: expires_in || null
      });
      console.log(`🔒 Token securely stored for merchant: ${finalMerchantId}`);
    } else {
      console.log("⚠️ Cannot save token: missing merchant_id or access_token");
      console.log(`   merchant_id: ${finalMerchantId}, has_token: ${!!access_token}`);
    }

    // Return success WITHOUT full token
    res.json({
      success: true,
      message: "Token exchange successful" + (finalMerchantId ? " and stored securely" : ""),
      merchant_id: finalMerchantId,
      token_stored: !!(finalMerchantId && access_token),
      expires_in_hours: expires_in ? Math.floor(expires_in / 3600) : null,
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
    // Save token securely
    if (merchant_id && access_token) {
      TokenStorage.saveToken(merchant_id, {
        access_token: access_token,
        expires_in: expires_in || null
      });
      console.log(`🔒 Token securely stored for merchant: ${merchant_id}`);
    }

    // Return success WITHOUT full token
    res.json({
      success: true,
      message: "Token exchange successful and stored securely",
      merchant_id: merchant_id,
      token_stored: !!(merchant_id && access_token),
      expires_in_hours: expires_in ? Math.floor(expires_in / 3600) : null,
      timestamp: new Date().toISOString()
      // NOTE: We don't send access_token in response
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

// Get stored token for a merchant (protected route)
router.get("/token/:merchantId", (req, res) => {
  const { merchantId } = req.params;
  const token = TokenStorage.getToken(merchantId);
  
  if (!token) {
    return res.status(404).json({
      success: false,
      error: "Token not found",
      message: `No token stored for merchant ${merchantId}`
    });
  }

  // Return token info without exposing full token in API
  res.json({
    success: true,
    merchant_id: merchantId,
    token_available: true,
    obtained_at: token.obtained_at,
    expires_in: token.expires_in,
    expires_soon: token.expires_in ? 
      (Date.now() > new Date(token.obtained_at).getTime() + (token.expires_in * 1000 * 0.9)) : 
      false
  });
});

// List all merchants with tokens
router.get("/tokens", (req, res) => {
  const merchants = TokenStorage.listMerchants();
  res.json({
    success: true,
    count: merchants.length,
    merchants: merchants
  });
});

module.exports = router;
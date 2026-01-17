const express = require("express");
const axios = require("axios");
const router = express.Router();

const APP_ID = process.env.CLOVER_APP_ID;
const APP_SECRET = process.env.CLOVER_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const TokenStorage = require("../utils/tokenStorage");

// Generate authorization URL
router.get("/url", (req, res) => {
  if (!APP_ID || !REDIRECT_URI) {
    return res.status(400).json({
      error: "Configuration missing",
      message: "CLOVER_APP_ID or REDIRECT_URI not set"
    });
  }

  // ADD THESE SCOPES - REQUIRED FOR API PERMISSIONS
  const scopes = [
    'com.clover.merchant:read',
    'com.clover.orders:read',
    'com.clover.items:read',
    'com.clover.employees:read'
  ].join('+');

  const authUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scopes}`;
  
  res.json({
    success: true,
    auth_url: authUrl,
    message: "Use this URL to authorize with Clover",
    scopes: scopes
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
    console.log("🔍 Full response:", JSON.stringify(response.data));

    let finalMerchantId = tokenMerchantId || incomingMerchantId;
    
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

    if (finalMerchantId && access_token) {
      TokenStorage.saveToken(finalMerchantId, {
        access_token: access_token,
        expires_in: expires_in || null,
        obtained_at: new Date().toISOString()
      });
      console.log(`🔒 Token securely stored for merchant: ${finalMerchantId}`);
    } else {
      console.log("⚠️ Cannot save token: missing merchant_id or access_token");
    }

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

// Get stored token for a merchant
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
// ============================================================================
// CLOVER API ROUTES
// ============================================================================

// Get merchant info from Clover
router.get("/merchant", async (req, res) => {
  try {
    const merchantId = req.query.merchant_id || "Q82R0D2NSRR81";
    const token = TokenStorage.getToken(merchantId);

    console.log("=== DEBUG MERCHANT API CALL ===");
    console.log("Merchant ID:", merchantId);
    console.log("Token exists:", !!token);
    if (token) {
      console.log("Token has access_token:", !!token.access_token);
      console.log("Token obtained:", token.obtained_at);
      console.log("Token age (seconds):", 
        Math.floor((Date.now() - new Date(token.obtained_at).getTime()) / 1000));
    }
    console.log("==============================");

    if (!token || !token.access_token) {
      return res.status(401).json({
        success: false,
        error: "No access token found",
        merchant_id: merchantId,
        hint: "Please authorize first via /auth/url"
      });
    }

    const response = await axios.get(
      `https://sandbox.dev.clover.com/v3/merchants/${merchantId}`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/json"
        }
      }
    );

    res.json({
      success: true,
      merchant_id: merchantId,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Merchant API error:", error.message);
    console.error("Error details:", error.response?.data);
    res.status(500).json({
      success: false,
      error: "Failed to fetch merchant data",
      message: error.response?.data || error.message
    });
  }
});

// Get orders from Clover
router.get("/orders", async (req, res) => {
  try {
    const merchantId = req.query.merchant_id || "Q82R0D2NSRR81";
    const token = TokenStorage.getToken(merchantId);

    if (!token || !token.access_token) {
      return res.status(401).json({ 
        success: false,
        error: "No access token found" 
      });
    }

    const limit = req.query.limit || 10;
    const response = await axios.get(
      `https://sandbox.dev.clover.com/v3/merchants/${merchantId}/orders?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/json"
        }
      }
    );

    res.json({
      success: true,
      merchant_id: merchantId,
      count: response.data.elements?.length || 0,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Orders API error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
      message: error.response?.data || error.message
    });
  }
});

// Get items from Clover
router.get("/items", async (req, res) => {
  try {
    const merchantId = req.query.merchant_id || "Q82R0D2NSRR81";
    const token = TokenStorage.getToken(merchantId);

    if (!token || !token.access_token) {
      return res.status(401).json({ 
        success: false,
        error: "No access token found" 
      });
    }

    const limit = req.query.limit || 20;
    const response = await axios.get(
      `https://sandbox.dev.clover.com/v3/merchants/${merchantId}/items?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/json"
        }
      }
    );

    res.json({
      success: true,
      merchant_id: merchantId,
      count: response.data.elements?.length || 0,
      data: response.data,
      timestamp: new Date().toISOString()
    });
// Get employees from Clover
router.get("/employees", async (req, res) => {
  try {
    const merchantId = req.query.merchant_id || "Q82R0D2NSRR81";
    const token = TokenStorage.getToken(merchantId);

    if (!token || !token.access_token) {
      return res.status(401).json({ 
        success: false,
        error: "No access token found" 
      });
    }

    const response = await axios.get(
      `https://sandbox.dev.clover.com/v3/merchants/${merchantId}/employees`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/json"
        }
      }
    );

    res.json({
      success: true,
      merchant_id: merchantId,
      count: response.data.elements?.length || 0,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Employees API error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
      message: error.response?.data || error.message
    });
  }
});

// Test endpoint with /me instead of /{id}
router.get("/test-me", async (req, res) => {
  try {
    const merchantId = "Q82R0D2NSRR81";
    const token = TokenStorage.getToken(merchantId);

    console.log("=== TEST /me ENDPOINT ===");
    console.log("Token exists:", !!token);
    console.log("Access token:", token?.access_token?.substring(0, 30) + "...");

    if (!token || !token.access_token) {
      return res.status(401).json({ error: "No token" });
    }

    const response = await axios.get(
      `https://sandbox.dev.clover.com/v3/merchants/me`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/json"
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error("Test /me error:", error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

// API Key test endpoint
router.get("/test-apikey", async (req, res) => {
  try {
    const API_KEY = "28f66577-ec74-76be-acac-55256d01dcaa";
    
    console.log("🔧 Testing with API key...");
    
    const response = await axios.get(
      "https://sandbox.dev.clover.com/v3/merchants/Q82R0D2NSRR81",
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      }
    );
    
    res.json({
      success: true,
      method: "API Key",
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("API Key test error:", error.message);
    console.error("Error details:", error.response?.data);
    res.status(500).json({
      success: false,
      error: "API Key test failed",
      message: error.response?.data || error.message
    });
  }
});

// API Key endpoint (REAL WORKING METHOD)
router.get("/real-merchant", async (req, res) => {
  try {
    const API_KEY = "28f66577-ec74-76be-acac-55256d01dcaa";
    
    console.log("🚀 Using REAL API key");
    
    const response = await axios.get(
      "https://sandbox.dev.clover.com/v3/merchants/Q82R0D2NSRR81",
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      }
    );
    
    res.json({
      success: true,
      message: "API Key method works!",
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("API Key error:", error.message);
    console.error("Error details:", error.response?.data);
    res.status(500).json({
      success: false,
      error: "API Key failed",
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
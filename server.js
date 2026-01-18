require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ YOUR CORRECT CREDENTIALS
const CLOVER_APP_ID = "JD06DKTZ0E7MT";
const CLOVER_APP_SECRET = "fd9a48ba-4357-c812-9558-62c27b182680";

// Your Render URL (this will auto-detect)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || "https://myserver-wk8h.onrender.com";
const REDIRECT_URI = RENDER_URL + "/oauth/callback";

console.log("🚀 Clover OAuth Server");
console.log("✅ Render URL:", RENDER_URL);
console.log("✅ Redirect URI:", REDIRECT_URI);
console.log("✅ App ID:", CLOVER_APP_ID);

// Home page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>✅ Clover OAuth - myserver</title>
      <style>
        body { font-family: Arial; padding: 40px; text-align: center; }
        .btn { 
          background: #6ABD45; color: white; padding: 15px 30px; 
          text-decoration: none; border-radius: 5px; font-size: 18px;
          display: inline-block; margin: 20px;
        }
      </style>
    </head>
    <body>
      <h1>✅ Clover OAuth - myserver</h1>
      <p>Your existing Render service, now with Clover OAuth!</p>
      <a href="/auth/clover" class="btn">Connect Clover Account</a>
      <p>URL: ${RENDER_URL}</p>
    </body>
    </html>
  `);
});

// Start OAuth
app.get("/auth/clover", (req, res) => {
  const authUrl = "https://www.clover.com/oauth/authorize?client_id=" + CLOVER_APP_ID + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) + "&response_type=code";
  console.log("🔗 OAuth URL:", authUrl);
  res.redirect(authUrl);
});

// Callback handler
app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;
  console.log("📞 Callback received, code:", code ? "YES" : "NO");
  
  if (!code) {
    return res.send("<h1>❌ No code received</h1>");
  }
  
  try {
    console.log("🔄 Exchanging code for token...");
    
    const response = await axios.post("https://api.clover.com/oauth/token", null, {
      params: {
        client_id: CLOVER_APP_ID,
        client_secret: CLOVER_APP_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI
      }
    });
    
    const token = response.data.access_token;
    const merchantId = response.data.merchant_id;
    
    console.log("✅ SUCCESS! Token for merchant:", merchantId);
    
    res.send(`
      <h1 style="color: #6ABD45;">🎉 CLOVER OAUTH SUCCESS!</h1>
      <p><strong>Merchant ID:</strong> ${merchantId}</p>
      <p><strong>Access Token:</strong> ${token.substring(0, 50)}...</p>
      <p><a href="/">Back to Home</a></p>
    `);
    
  } catch (error) {
    res.send("<h1 style='color: red;'>❌ Error: " + error.message + "</h1>");
  }
});

app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
  console.log("✅ Open:", RENDER_URL);
});

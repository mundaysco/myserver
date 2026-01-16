require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_ID = process.env.CLOVER_APP_ID;
const APP_SECRET = process.env.CLOVER_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "https://myserver-wk8h.onrender.com/callback";
const SITE_URL = process.env.SITE_URL || "https://myserver-wk8h.onrender.com";

console.log("=== ENVIRONMENT CHECK ===");
console.log("APP_ID:", APP_ID);
console.log("APP_SECRET:", APP_SECRET ? "✅ Set" : "❌ Missing");
console.log("REDIRECT_URI:", REDIRECT_URI);
console.log("SITE_URL:", SITE_URL);
console.log("========================");

app.get("/", (req, res) => {
  const { code, merchant_id, error } = req.query;
  
  let html = `
  <html>
  <head><title>Max Clover App</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    .box { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 10px; }
    .btn { background: blue; color: white; padding: 10px 20px; border: none; cursor: pointer; }
    .error { color: red; }
    .success { color: green; }
  </style>
  </head>
  <body>
    <h1>Max Clover App</h1>
    <div class="box">
      <p><strong>App ID:</strong> ${APP_ID}</p>
      <p><strong>App Secret:</strong> ${APP_SECRET ? "✅ Set" : "❌ Missing"}</p>
      <p><strong>Redirect URI:</strong> ${REDIRECT_URI}</p>
      <p><strong>Site URL:</strong> ${SITE_URL}</p>
  `;
  
  if (error) {
    html += `<p class="error"><strong>Error:</strong> ${error}</p>`;
  }
  
  if (code) {
    html += `
      <h3 class="success">✅ Authorization Code Received!</h3>
      <p><strong>Code:</strong> ${code}</p>
      <p><strong>Merchant ID:</strong> ${merchant_id || "Not provided"}</p>
      <button class="btn" onclick="exchangeToken()">Exchange Code for Token</button>
      <div id="result"></div>
      <script>
        async function exchangeToken() {
          const resultEl = document.getElementById('result');
          resultEl.innerHTML = '<p>🔄 Exchanging token...</p>';
          
          const res = await fetch("/exchange", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({code: "${code}"})
          });
          
          const data = await res.json();
          
          if (data.success) {
            resultEl.innerHTML = 
              '<p class="success">✅ Token: ' + (data.access_token || "").substring(0, 30) + '...</p>' +
              '<p>Merchant ID: ' + data.merchant_id + '</p>';
          } else {
            resultEl.innerHTML = 
              '<p class="error">❌ Error: ' + data.error + '</p>' +
              '<p>Details: ' + JSON.stringify(data.details) + '</p>';
          }
        }
      </script>
    `;
  } else {
    html += `
      <h3>Start OAuth Flow</h3>
      <a href="https://sandbox.dev.clover.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code" 
         class="btn" target="_blank">
        Authorize with Clover
      </a>
    `;
  }
  
  html += "</div></body></html>";
  res.send(html);
});

app.get("/callback", (req, res) => {
  const { code, merchant_id, error } = req.query;
  
  console.log("Callback received - Code:", code);
  console.log("Merchant ID:", merchant_id);
  
  if (error) {
    return res.redirect("/?error=" + encodeURIComponent(error));
  }
  
  if (code) {
    return res.redirect("/?code=" + code + "&merchant_id=" + (merchant_id || ""));
  }
  
  res.redirect("/");
});

app.post("/exchange", async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.json({ success: false, error: "No code provided" });
    }
    
    console.log("Exchanging code:", code.substring(0, 20) + "...");
    
    const response = await axios.post(
      "https://sandbox.dev.clover.com/oauth/token",
      new URLSearchParams({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    
    console.log("✅ Token exchange successful!");
    
    res.json({ 
      success: true, 
      ...response.data,
      access_token: response.data.access_token ? response.data.access_token.substring(0, 30) + "..." : null
    });
    
  } catch (error) {
    console.error("Exchange error:", error.response?.data || error.message);
    
    res.json({ 
      success: false, 
      error: "Exchange failed",
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Access: ${SITE_URL}`);
});

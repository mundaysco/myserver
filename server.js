require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_ID = process.env.CLOVER_APP_ID;
const APP_SECRET = process.env.CLOVER_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

console.log("=== MAX CLOVER APP ===");
console.log("App ID:", APP_ID);
console.log("App Secret:", APP_SECRET ? "✅ Set" : "❌ Missing");
console.log("Redirect URI:", REDIRECT_URI);
console.log("======================");

app.get("/", (req, res) => {
  const { code, merchant_id } = req.query;
  
  let html = `
  <html>
  <head><title>Max Clover App</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    .box { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 10px; }
    .btn { background: blue; color: white; padding: 10px 20px; border: none; cursor: pointer; }
  </style>
  </head>
  <body>
    <h1>Max Clover App</h1>
    <div class="box">
      <p><strong>App ID:</strong> ${APP_ID || "Not set"}</p>
      <p><strong>App Secret:</strong> ${APP_SECRET ? "✅ Set" : "❌ Missing"}</p>
  `;
  
  if (code) {
    html += `
      <h3>✅ Code Received!</h3>
      <p>Code: ${code}</p>
      <button class="btn" onclick="exchangeToken()">Get Access Token</button>
      <div id="result"></div>
      <script>
        async function exchangeToken() {
          const res = await fetch("/exchange", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({code: "${code}"})
          });
          const data = await res.json();
          document.getElementById("result").innerHTML = 
            data.success ? "<p>✅ Token: " + data.access_token.substring(0, 30) + "...</p>" : 
                          "<p>❌ Error: " + data.error + "</p>";
        }
      </script>
    `;
  } else {
    html += `
      <h3>📝 Setup Instructions:</h3>
      <ol>
        <li>Start ngrok: <code>ngrok http 3000</code></li>
        <li>Update .env with ngrok URL</li>
        <li>Configure Clover Dashboard</li>
        <li>Install app from Clover App Market</li>
      </ol>
    `;
  }
  
  html += "</div></body></html>";
  res.send(html);
});

app.post("/exchange", async (req, res) => {
  try {
    const { code } = req.body;
    console.log("Exchanging code:", code?.substring(0, 20) + "...");
    
    const response = await axios.post("https://apisandbox.dev.clover.com/oauth/v2/token", {
      client_id: APP_ID,
      client_secret: APP_SECRET,
      code: code,
      redirect_uri: REDIRECT_URI
    });
    
    console.log("✅ Token received");
    res.json({ success: true, ...response.data });
    
  } catch (error) {
    console.error("❌ Exchange failed:", error.response?.data || error.message);
    res.json({ 
      success: false, 
      error: "Exchange failed", 
      details: error.response?.data?.message 
    });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Server: http://localhost:" + PORT);
});

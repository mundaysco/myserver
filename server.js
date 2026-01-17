require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const APP_ID = process.env.CLOVER_APP_ID;
const APP_SECRET = process.env.CLOVER_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

console.log("=== MAX CLOVER APP ===");;
console.log("App ID:", APP_ID);
console.log("App Secret:", APP_SECRET ? "âœ… Set" : "âŒ Missing");
console.log("Redirect URI:", REDIRECT_URI);
console.log("=== MAX CLOVER APP ===");;

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
      <p><strong>App Secret:</strong> ${APP_SECRET ? "âœ… Set" : "âŒ Missing"}</p>
  `;
  
  if (code) {
    html += `
      <h3>âœ… Code Received!</h3>
      <p>Code: ${code}</p>
      ${merchant_id ? `<p>Merchant ID: ${merchant_id}</p>` : ''}
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
            data.success ? "<p>âœ… Token: " + data.access_token.substring(0, 30) + "...</p>" : 
                          "<p>âŒ Error: " + data.error + "</p>";
        }
      </script>
    `;
  } else {
    html += `
      <h3>ðŸ“ Setup Instructions:</h3>
      <ol>
        <li>Configure Clover Dashboard with callback URL</li>
        <li>Start OAuth flow from Clover App Market</li>
        <li>Exchange code for access token</li>
      </ol>
    `;
  }
  
  html += "</div></body></html>";
  res.send(html);
});

// OAuth Callback Route
app.get("/callback", (req, res) => {
  const { code, merchant_id, employee_id, client_id, error } = req.query;
  
  console.log("ðŸ“¨ OAuth Callback Received:");
  console.log("  Code:", code);
  console.log("  Merchant ID:", merchant_id);
  console.log("  Employee ID:", employee_id);
  console.log("  Client ID:", client_id);
  
  if (error) {
    console.error("âŒ OAuth Error:", error);
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }
  
  if (code) {
    console.log("âœ… Authorization successful, redirecting with code");
    return res.redirect(`/?code=${code}&merchant_id=${merchant_id}`);
  }
  
  res.redirect("/");
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
    
    console.log("âœ… Token received");
    res.json({ success: true, ...response.data });
    
  } catch (error) {
    console.error("âŒ Exchange failed:", error.response?.data || error.message);
    res.json({ 
      success: false, 
      error: "Exchange failed", 
      details: error.response?.data?.message 
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("ðŸš€ Server: http://localhost:" + PORT);
});



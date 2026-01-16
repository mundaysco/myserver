const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// ====== MIDDLEWARE ======
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ====== ROUTES ======


muhei@WXSDOM MINGW64 ~
$ ^C

muhei@WXSDOM MINGW64 ~
$ cd /c/Users/muhei/Desktop/Max-Clover

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover
$ ls -la
# Look for .git folder
total 119
drwxr-xr-x 1 muhei 197609     0 Jan 16 11:04 ./
drwxr-xr-x 1 muhei 197609     0 Jan 16 03:21 ../
-rw-r--r-- 1 muhei 197609   216 Jan 16 03:36 .env
-rw-r--r-- 1 muhei 197609   299 Jan 16 11:04 .gitignore
drwxr-xr-x 1 muhei 197609     0 Jan 16 03:22 node_modules/
-rw-r--r-- 1 muhei 197609 31833 Jan 16 03:22 package-lock.json
-rw-r--r-- 1 muhei 197609   224 Jan 16 03:21 package.json
-rw-r--r-- 1 muhei 197609  3056 Jan 16 03:22 server.js

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover
$ ^C

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover
$ ^[[200~git init~
bash: $'\E[200~git': command not found

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover
$ git init
Initialized empty Git repository in C:/Users/muhei/Desktop/Max-Clover/.git/

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ git status
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        package-lock.json
        package.json
        server.js

nothing added to commit but untracked files present (use "git add" to track)

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ ^C

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ git config user.name "mundays"
git config user.email "mundaysco@gmail.com"

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ git add .
git commit -m "Initial commit: Max-Clover Node.js server"
warning: in the working copy of '.gitignore', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package-lock.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'server.js', LF will be replaced by CRLF the next time Git touches it
[master (root-commit) 2f0662d] Initial commit: Max-Clover Node.js server
 4 files changed, 1020 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 package-lock.json
 create mode 100644 package.json
 create mode 100644 server.js

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ ^C

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ git remote add origin https://github.com/mundaysco/myserver.git

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ ^[[200~git branch -M main
bash: $'\E[200~git': command not found

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ git push -u origin main
error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/mundaysco/myserver.git'

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (master)
$ git branch -M main
git push -u origin main
info: please complete authentication in your browser...
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (6/6), 10.57 KiB | 1.32 MiB/s, done.
Total 6 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
To https://github.com/mundaysco/myserver.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (main)
$ # Check remote is set correctly
git remote -v

# Should show:
# origin  https://github.com/mundaysco/myserver.git (fetch)
# origin  https://github.com/mundaysco/myserver.git (push)
origin  https://github.com/mundaysco/myserver.git (fetch)
origin  https://github.com/mundaysco/myserver.git (push)

muhei@WXSDOM MINGW64 ~/Desktop/Max-Clover (main)
$ # Check remote is set correctly

# Open in browser or check with curl
curl https://myserver-wk8h.onrender.com
# Create a new server.js with the route added
cat > server.js << 'EOF'
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
            data.success ? "<p>✅ Token: " + data.access_token.substring(0, 30) + "...</p>" : 
                          "<p>❌ Error: " + data.error + "</p>";
        }
      </script>
    `;
  } else {
    html += `
      <h3>📝 Setup Instructions:</h3>
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
  
  console.log("📨 OAuth Callback Received:");
  console.log("  Code:", code);
  console.log("  Merchant ID:", merchant_id);
  console.log("  Employee ID:", employee_id);
  console.log("  Client ID:", client_id);
  
  if (error) {
    console.error("❌ OAuth Error:", error);
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }
  
  if (code) {
    console.log("✅ Authorization successful, redirecting with code");
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

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server: http://localhost:" + PORT);
});

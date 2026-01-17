// src/utils/cloverOAuth.js
const fs = require('fs').promises;
const path = require('path');

const CLOVER_TOKEN_URL = "https://apisandbox.dev.clover.com/oauth/v2/token";
const CLOVER_API_BASE = "https://sandbox.dev.clover.com/v3";

// Get environment variables
const APP_ID = process.env.CLOVER_APP_ID || "NPD2SHE7SJ3BY";
const APP_SECRET = process.env.CLOVER_APP_SECRET;

if (!APP_SECRET) {
    console.error("⚠️  WARNING: CLOVER_APP_SECRET not set in environment variables");
}

// Token storage directory
const TOKEN_DIR = path.join(__dirname, '../../tokens');

// Ensure token directory exists
async function ensureTokenDir() {
    try {
        await fs.mkdir(TOKEN_DIR, { recursive: true });
    } catch (err) {
        // Directory already exists
    }
}

// Exchange code for token
async function exchangeCodeForToken(merchant_id, code) {
    try {
        if (!APP_SECRET) {
            throw new Error("CLOVER_APP_SECRET not configured");
        }
        
        console.log(`🔄 Exchanging code for token for merchant: ${merchant_id}`);
        
        const response = await fetch(CLOVER_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: APP_ID,
                client_secret: APP_SECRET,
                code: code,
                redirect_uri: ""
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
        }
        
        const tokenData = await response.json();
        
        // Store token
        await storeToken(merchant_id, tokenData);
        
        console.log(`✅ Token obtained for merchant: ${merchant_id}`);
        return tokenData;
        
    } catch (error) {
        console.error("❌ Token exchange error:", error.message);
        throw error;
    }
}

// Store token in file
async function storeToken(merchant_id, tokenData) {
    try {
        await ensureTokenDir();
        
        const tokenFile = path.join(TOKEN_DIR, `${merchant_id}.json`);
        const dataToStore = {
            ...tokenData,
            merchant_id: merchant_id,
            fetched_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
        };
        
        await fs.writeFile(tokenFile, JSON.stringify(dataToStore, null, 2));
        console.log(`💾 Token stored for merchant: ${merchant_id}`);
        
    } catch (error) {
        console.error("Error storing token:", error);
        throw error;
    }
}

// Get stored token
async function getToken(merchant_id) {
    try {
        await ensureTokenDir();
        
        const tokenFile = path.join(TOKEN_DIR, `${merchant_id}.json`);
        
        // Check if file exists and is not too old
        try {
            const stats = await fs.stat(tokenFile);
            const fileContent = await fs.readFile(tokenFile, 'utf8');
            const tokenData = JSON.parse(fileContent);
            
            // Check if token is expired
            const expiresAt = new Date(tokenData.expires_at);
            if (expiresAt < new Date()) {
                console.log(`🔄 Token expired for merchant: ${merchant_id}`);
                return null;
            }
            
            return tokenData;
            
        } catch (err) {
            // File doesn't exist or is invalid
            return null;
        }
        
    } catch (error) {
        console.error("Error reading token:", error);
        return null;
    }
}

// Make API request with token
async function makeCloverRequest(merchant_id, endpoint, options = {}) {
    try {
        const tokenData = await getToken(merchant_id);
        
        if (!tokenData || !tokenData.access_token) {
            throw new Error("No valid token found. Please re-authenticate.");
        }
        
        const url = `${CLOVER_API_BASE}/merchants/${merchant_id}/${endpoint}`;
        
        const defaultHeaders = {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json"
        };
        
        const response = await fetch(url, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token might be expired
                console.log(`⚠️  Token invalid for merchant: ${merchant_id}`);
                return null;
            }
            throw new Error(`Clover API error: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error("Clover request error:", error.message);
        throw error;
    }
}

module.exports = {
    exchangeCodeForToken,
    getToken,
    storeToken,
    makeCloverRequest,
    ensureTokenDir
};

const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

// Use environment variable for encryption key
// In production, set ENCRYPTION_KEY in Render
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-change-in-production-1234567890';

class TokenStorage {
  constructor() {
    // Store tokens in a 'tokens' folder at project root
    this.tokensDir = path.join(__dirname, '../../tokens');
    this.ensureTokensDir();
  }

  ensureTokensDir() {
    if (!fs.existsSync(this.tokensDir)) {
      fs.mkdirSync(this.tokensDir, { recursive: true });
    }
  }

  // Encrypt token before saving
  encryptToken(token) {
    return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
  }

  // Decrypt token when reading
  decryptToken(encryptedToken) {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Save token for a merchant
  saveToken(merchantId, tokenData) {
    const filePath = path.join(this.tokensDir, `${merchantId}.json`);
    
    const encryptedData = {
      merchant_id: merchantId,
      access_token: this.encryptToken(tokenData.access_token),
      obtained_at: new Date().toISOString(),
      expires_in: tokenData.expires_in || null
    };

    fs.writeFileSync(filePath, JSON.stringify(encryptedData, null, 2), 'utf8');
    console.log(`✅ Token saved securely for merchant: ${merchantId}`);
    return true;
  }

  // Get token for a merchant
  getToken(merchantId) {
    const filePath = path.join(this.tokensDir, `${merchantId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return {
        access_token: this.decryptToken(data.access_token),
        obtained_at: data.obtained_at,
        expires_in: data.expires_in
      };
    } catch (error) {
      console.error('❌ Error reading token:', error);
      return null;
    }
  }

  // List all merchants with tokens
  listMerchants() {
    if (!fs.existsSync(this.tokensDir)) {
      return [];
    }

    const files = fs.readdirSync(this.tokensDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  // Delete token for a merchant
  deleteToken(merchantId) {
    const filePath = path.join(this.tokensDir, `${merchantId}.json`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Token deleted for merchant: ${merchantId}`);
      return true;
    }
    return false;
  }

  // Check if token exists and is valid
  hasValidToken(merchantId) {
    const token = this.getToken(merchantId);
    if (!token) return false;
    
    if (token.expires_in) {
      const obtainedTime = new Date(token.obtained_at).getTime();
      const currentTime = Date.now();
      const expiresTime = obtainedTime + (token.expires_in * 1000);
      
      // Token expires if within 90% of its lifetime
      return currentTime < expiresTime * 0.9;
    }
    
    return true; // No expiration
  }
}

module.exports = new TokenStorage();
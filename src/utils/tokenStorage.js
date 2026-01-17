const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-change-in-production';

class TokenStorage {
  constructor() {
    this.tokensDir = path.join(__dirname, '../../tokens');
    if (!fs.existsSync(this.tokensDir)) {
      fs.mkdirSync(this.tokensDir, { recursive: true });
    }
  }

  encryptToken(token) {
    return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
  }

  decryptToken(encryptedToken) {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  saveToken(merchantId, tokenData) {
    const filePath = path.join(this.tokensDir, `${merchantId}.json`);
    const encryptedData = {
      merchant_id: merchantId,
      access_token: this.encryptToken(tokenData.access_token),
      obtained_at: new Date().toISOString(),
      expires_in: tokenData.expires_in || null
    };
    fs.writeFileSync(filePath, JSON.stringify(encryptedData, null, 2), 'utf8');
    console.log(`✅ Token saved for merchant: ${merchantId}`);
    return true;
  }

  getToken(merchantId) {
    const filePath = path.join(this.tokensDir, `${merchantId}.json`);
    if (!fs.existsSync(filePath)) return null;
    
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

  listMerchants() {
    if (!fs.existsSync(this.tokensDir)) return [];
    const files = fs.readdirSync(this.tokensDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  deleteToken(merchantId) {
    const filePath = path.join(this.tokensDir, `${merchantId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Token deleted for merchant: ${merchantId}`);
      return true;
    }
    return false;
  }

  hasValidToken(merchantId) {
    const token = this.getToken(merchantId);
    if (!token) return false;
    
    if (token.expires_in) {
      const obtainedTime = new Date(token.obtained_at).getTime();
      const currentTime = Date.now();
      const expiresTime = obtainedTime + (token.expires_in * 1000);
      return currentTime < expiresTime * 0.9;
    }
    
    return true;
  }
}

module.exports = new TokenStorage();
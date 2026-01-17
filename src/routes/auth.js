// src/routes/auth.js - Fixed version
const express = require("express");
const router = express.Router();

// OAuth callback handler
router.get("/callback", async (req, res) => {
    try {
        const { merchant_id, code } = req.query;
        
        if (!merchant_id || !code) {
            return res.status(400).json({ error: "Missing merchant_id or code" });
        }
        
        // Basic response - real implementation would exchange code for token
        res.json({
            success: true,
            message: "OAuth callback received",
            merchant_id: merchant_id,
            has_code: !!code,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error("Auth callback error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

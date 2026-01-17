// src/routes/butterApi.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

// Read token store
async function getTokenStore() {
    try {
        const tokenPath = path.join(__dirname, "../../tokens");
        const files = await fs.readdir(tokenPath);
        const tokens = {};
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(path.join(tokenPath, file), 'utf8');
                const merchantId = file.replace('.json', '');
                tokens[merchantId] = JSON.parse(content);
            }
        }
        return tokens;
    } catch (err) {
        console.error("Error reading tokens:", err);
        return {};
    }
}

// Get merchant orders from Clover
router.get("/orders", async (req, res) => {
    try {
        const { merchant_id, limit = 50 } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        const tokens = await getTokenStore();
        const tokenData = tokens[merchant_id];
        
        if (!tokenData || !tokenData.access_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        
        // Fetch from Clover API
        const cloverResponse = await fetch(
            `https://sandbox.dev.clover.com/v3/merchants/${merchant_id}/orders?limit=${limit}&expand=lineItems,payments`,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        
        if (!cloverResponse.ok) {
            throw new Error(`Clover API error: ${cloverResponse.status}`);
        }
        
        const orders = await cloverResponse.json();
        res.json(orders);
        
    } catch (error) {
        console.error("Orders API error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get merchant payments
router.get("/payments", async (req, res) => {
    try {
        const { merchant_id, limit = 50 } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        const tokens = await getTokenStore();
        const tokenData = tokens[merchant_id];
        
        if (!tokenData || !tokenData.access_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        
        const cloverResponse = await fetch(
            `https://sandbox.dev.clover.com/v3/merchants/${merchant_id}/payments?limit=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        
        if (!cloverResponse.ok) {
            throw new Error(`Clover API error: ${cloverResponse.status}`);
        }
        
        const payments = await cloverResponse.json();
        res.json(payments);
        
    } catch (error) {
        console.error("Payments API error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get merchant items (inventory)
router.get("/items", async (req, res) => {
    try {
        const { merchant_id, limit = 100 } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        const tokens = await getTokenStore();
        const tokenData = tokens[merchant_id];
        
        if (!tokenData || !tokenData.access_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        
        const cloverResponse = await fetch(
            `https://sandbox.dev.clover.com/v3/merchants/${merchant_id}/items?limit=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        
        if (!cloverResponse.ok) {
            throw new Error(`Clover API error: ${cloverResponse.status}`);
        }
        
        const items = await cloverResponse.json();
        res.json(items);
        
    } catch (error) {
        console.error("Items API error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get merchant info
router.get("/merchant", async (req, res) => {
    try {
        const { merchant_id } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        const tokens = await getTokenStore();
        const tokenData = tokens[merchant_id];
        
        if (!tokenData || !tokenData.access_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        
        const cloverResponse = await fetch(
            `https://sandbox.dev.clover.com/v3/merchants/${merchant_id}`,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        
        if (!cloverResponse.ok) {
            throw new Error(`Clover API error: ${cloverResponse.status}`);
        }
        
        const merchant = await cloverResponse.json();
        res.json(merchant);
        
    } catch (error) {
        console.error("Merchant API error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Dashboard statistics
router.get("/stats", async (req, res) => {
    try {
        const { merchant_id } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        const tokens = await getTokenStore();
        const tokenData = tokens[merchant_id];
        
        if (!tokenData || !tokenData.access_token) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        
        // Fetch multiple endpoints in parallel
        const [ordersRes, paymentsRes, itemsRes] = await Promise.all([
            fetch(`https://sandbox.dev.clover.com/v3/merchants/${merchant_id}/orders?limit=500`, {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            }),
            fetch(`https://sandbox.dev.clover.com/v3/merchants/${merchant_id}/payments?limit=500`, {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            }),
            fetch(`https://sandbox.dev.clover.com/v3/merchants/${merchant_id}/items?limit=500`, {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            })
        ]);
        
        const orders = await ordersRes.json();
        const payments = await paymentsRes.json();
        const items = await itemsRes.json();
        
        // Calculate stats
        const totalRevenue = payments.elements?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
        const totalOrders = orders.elements?.length || 0;
        const totalItems = items.elements?.length || 0;
        
        // Calculate today's revenue
        const today = new Date().toISOString().split('T')[0];
        const todayRevenue = payments.elements
            ?.filter(p => p.createdTime?.startsWith(today))
            ?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        
        res.json({
            totalRevenue: totalRevenue / 100, // Convert cents to dollars
            todayRevenue: todayRevenue / 100,
            totalOrders,
            totalItems,
            activeCustomers: 0, // Would need customers endpoint
            averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders / 100).toFixed(2) : 0,
            currency: "USD"
        });
        
    } catch (error) {
        console.error("Stats API error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

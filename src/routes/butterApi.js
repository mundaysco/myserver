// src/routes/butterApi.js - Clean working version
const express = require("express");
const router = express.Router();
const { getToken, makeCloverRequest } = require("../utils/cloverOAuth");

// Dashboard statistics
router.get("/stats", async (req, res) => {
    try {
        const { merchant_id } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        // Check if we have a valid token
        const tokenData = await getToken(merchant_id);
        if (!tokenData) {
            return res.status(401).json({ 
                error: "Not authenticated", 
                message: "Please launch the app from Clover Sandbox first" 
            });
        }
        
        // Fetch orders and payments
        const [orders, payments] = await Promise.all([
            makeCloverRequest(merchant_id, "orders?limit=100"),
            makeCloverRequest(merchant_id, "payments?limit=100")
        ]);
        
        if (!orders || !payments) {
            return res.status(401).json({ error: "Authentication expired" });
        }
        
        // Calculate stats
        const totalRevenue = payments.elements?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
        const totalOrders = orders.elements?.length || 0;
        
        // Calculate today's revenue
        const today = new Date().toISOString().split('T')[0];
        const todayRevenue = payments.elements
            ?.filter(p => p.createdTime?.startsWith(today))
            ?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        
        // Calculate average order value
        const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders / 100).toFixed(2) : 0;
        
        res.json({
            totalRevenue: totalRevenue / 100, // Convert cents to dollars
            todayRevenue: todayRevenue / 100,
            totalOrders,
            averageOrderValue,
            currency: "USD",
            lastUpdated: new Date().toISOString(),
            merchant_id
        });
        
    } catch (error) {
        console.error("Stats API error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get recent orders
router.get("/orders", async (req, res) => {
    try {
        const { merchant_id, limit = 10 } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        const orders = await makeCloverRequest(merchant_id, `orders?limit=${limit}&expand=lineItems`);
        
        if (!orders) {
            return res.status(401).json({ error: "Authentication expired" });
        }
        
        res.json(orders);
        
    } catch (error) {
        console.error("Orders API error:", error);
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
        
        const merchant = await makeCloverRequest(merchant_id, "");
        
        if (!merchant) {
            return res.status(401).json({ error: "Authentication expired" });
        }
        
        res.json(merchant);
        
    } catch (error) {
        console.error("Merchant API error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get items (inventory)
router.get("/items", async (req, res) => {
    try {
        const { merchant_id, limit = 50 } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        const items = await makeCloverRequest(merchant_id, `items?limit=${limit}`);
        
        if (!items) {
            return res.status(401).json({ error: "Authentication expired" });
        }
        
        res.json(items);
        
    } catch (error) {
        console.error("Items API error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get payments
router.get("/payments", async (req, res) => {
    try {
        const { merchant_id, limit = 50 } = req.query;
        
        if (!merchant_id) {
            return res.status(400).json({ error: "Merchant ID required" });
        }
        
        const payments = await makeCloverRequest(merchant_id, `payments?limit=${limit}`);
        
        if (!payments) {
            return res.status(401).json({ error: "Authentication expired" });
        }
        
        res.json(payments);
        
    } catch (error) {
        console.error("Payments API error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

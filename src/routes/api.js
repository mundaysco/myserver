const express = require("express");
const router = express.Router();

// API Info
router.get("/", (req, res) => {
  res.json({
    service: "Butter API",
    version: "1.0.0",
    description: "A smooth Clover integration app",
    endpoints: {
      auth: {
        get_auth_url: "GET /auth/url",
        callback: "GET /auth/callback",
        token_exchange: "POST /auth/token"
      },
      api: {
        info: "GET /api",
        health: "GET /health"
      }
    }
  });
});

module.exports = router;

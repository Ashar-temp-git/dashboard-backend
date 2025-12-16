/**
 * Dashboard Routes
 */

const express = require("express");
const dashboard = require("../Controllers/DashboardController");
const router = express.Router();
// const requireAuth = require("../Middleware/requireAuth");

// Protected routes (uncomment requireAuth to protect)
// router.use(requireAuth);

router.get("/getDashboard", dashboard.getDashboard);

module.exports = router;

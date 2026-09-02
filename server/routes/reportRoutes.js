const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createReport, getMyReports } = require("../controllers/reportController");

const router = express.Router();

// Submit a report about a property or user
router.post("/", protect, createReport);

// Get reports submitted by the logged-in user
router.get("/my-reports", protect, getMyReports);

module.exports = router;

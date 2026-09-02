const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getAgreement } = require("../controllers/agreementController");

const router = express.Router();

// Get rental agreement for an approved booking
router.get("/:bookingId", protect, getAgreement);

module.exports = router;

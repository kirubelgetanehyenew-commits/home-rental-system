const express = require("express");

const { getMyStats, getAdminStats } = require("../controllers/statsController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMyStats);
router.get("/admin", protect, authorizeRoles("admin"), getAdminStats);

module.exports = router;

const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getUsers,
  updateUserStatus,
  deleteUser,
  getProperties,
  updatePropertyStatus,
  deleteProperty,
  getReports,
  updateReport,
  getAdminOverview,
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, authorizeRoles("admin"));

// Overview stats
router.get("/overview", getAdminOverview);

// User management
router.get("/users", getUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

// Property management
router.get("/properties", getProperties);
router.put("/properties/:id/status", updatePropertyStatus);
router.delete("/properties/:id", deleteProperty);

// Reports management
router.get("/reports", getReports);
router.put("/reports/:id", updateReport);

module.exports = router;

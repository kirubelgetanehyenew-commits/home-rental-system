const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getUsers,
  updateUserStatus,
  deleteUser,
  getProperties,
  updatePropertyStatus,
  deleteProperty,
  getBookings,
  updateBookingStatus,
  deleteBooking,
  getPayments,
  updatePaymentStatus,
  deletePayment,
  getReviews,
  deleteReviewAdmin,
  updateUserRole,
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
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Property management
router.get("/properties", getProperties);
router.put("/properties/:id/status", updatePropertyStatus);
router.delete("/properties/:id", deleteProperty);

// Booking management
router.get("/bookings", getBookings);
router.put("/bookings/:id/status", updateBookingStatus);
router.delete("/bookings/:id", deleteBooking);

// Payment management
router.get("/payments", getPayments);
router.put("/payments/:id/status", updatePaymentStatus);
router.delete("/payments/:id", deletePayment);

// Review moderation
router.get("/reviews", getReviews);
router.delete("/reviews/:id", deleteReviewAdmin);

// Reports management
router.get("/reports", getReports);
router.put("/reports/:id", updateReport);

module.exports = router;

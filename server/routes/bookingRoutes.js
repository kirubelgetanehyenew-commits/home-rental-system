const express = require("express");

const {
  createBooking,
  getMyBookings,
  getReceivedBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All booking routes require authentication
router.use(protect);

router.get("/my-bookings", getMyBookings);
router.get("/received", getReceivedBookings);
router.post("/", createBooking);
router.put("/:id/status", updateBookingStatus);

module.exports = router;

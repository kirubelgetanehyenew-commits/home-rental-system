const express = require("express");

const {
  getPropertyReviews,
  upsertReview,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public: read reviews for a property
router.get("/property/:propertyId", getPropertyReviews);

// Protected: add/update my review, delete my review
router.post("/property/:propertyId", protect, upsertReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;

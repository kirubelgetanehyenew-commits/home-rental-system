const express = require("express");

const {
  getMyFavorites,
  toggleFavorite,
  getFavoritedIds,
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All favorite routes require authentication
router.use(protect);

router.get("/", getMyFavorites);
router.get("/ids", getFavoritedIds);
router.post("/:propertyId", toggleFavorite);

module.exports = router;

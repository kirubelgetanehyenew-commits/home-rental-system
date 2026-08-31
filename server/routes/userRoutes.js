const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getProfile, updateProfile, uploadAvatar, deleteAvatar } = require("../controllers/userController");

const router = express.Router();

// Protected Routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", protect, deleteAvatar);

module.exports = router;
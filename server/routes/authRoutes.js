const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendVerification,
  verifyEmail,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout (client should clear token)
router.post("/logout", protect, logout);

// Forgot / Reset password
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Email verification
router.post("/send-verification", protect, sendVerification);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;
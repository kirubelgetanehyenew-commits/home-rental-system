const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getConversation,
  getMessages,
  markAsRead,
} = require("../controllers/messageController");

const router = express.Router();

// Send a message about a property
router.post("/", protect, sendMessage);

// Get conversation about a property
router.get("/conversation/:propertyId/:userId", protect, getConversation);

// Get all messages for the logged-in user
router.get("/", protect, getMessages);

// Mark a message as read
router.put("/:id/read", protect, markAsRead);

module.exports = router;

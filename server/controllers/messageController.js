const Message = require("../models/Message");
const Property = require("../models/Property");
const { createNotification } = require("./notificationController");

// Send a message about a property
const sendMessage = async (req, res) => {
  try {
    const { property, recipient, content } = req.body;

    if (!property || !recipient || !content) {
      return res.status(400).json({
        success: false,
        message: "Property, recipient and content are required",
      });
    }

    const message = await Message.create({
      property,
      sender: req.user._id,
      recipient,
      content,
    });

    await createNotification({
      user: recipient,
      title: "New message",
      body: `${req.user.fullName}: ${content.slice(0, 60)}`,
      type: "message",
      link: "/messages",
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get conversation between two users about a property
const getConversation = async (req, res) => {
  try {
    const { propertyId, userId } = req.params;

    const messages = await Message.find({
      property: propertyId,
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender", "fullName email profileImage")
      .populate("recipient", "fullName email profileImage")
      .populate("property", "title location price")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages for the logged-in user
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    })
      .populate("sender", "fullName email profileImage")
      .populate("recipient", "fullName email profileImage")
      .populate("property", "title location price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a message as read
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getMessages,
  markAsRead,
};

const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Report = require("../models/Report");
const Message = require("../models/Message");
const Payment = require("../models/Payment");

// List users with search/filter/pagination
const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ fullName: regex }, { email: regex }];
    }
    if (role) query.role = role;
    if (status === "suspended") query.isSuspended = true;
    if (status === "active") query.isSuspended = { $ne: true };

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Suspend / activate a user
const updateUserStatus = async (req, res) => {
  try {
    const { isSuspended } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot suspend an admin" });
    }
    user.isSuspended = !!isSuspended;
    await user.save();
    res.status(200).json({
      success: true,
      message: user.isSuspended ? "User suspended" : "User activated",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot delete an admin" });
    }
    await user.deleteOne();
    // Remove orphaned messages involving this user
    await Message.deleteMany({
      $or: [{ sender: user._id }, { recipient: user._id }],
    });
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all properties for admin
const getProperties = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("owner", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      properties,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve / reject / suspend a property
const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "pending"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid property status" });
    }
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    property.status = status;
    await property.save();
    res.status(200).json({
      success: true,
      message: `Property ${status}`,
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    await property.deleteOne();
    // Remove orphaned messages/bookings referencing this property
    await Promise.all([
      Message.deleteMany({ property: property._id }),
      Booking.deleteMany({ property: property._id }),
    ]);
    res.status(200).json({ success: true, message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "fullName email")
      .populate("property", "title location")
      .populate("reportedUser", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resolve / dismiss a report
const updateReport = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    if (!["resolved", "dismissed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid report status" });
    }
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }
    report.status = status;
    if (adminResponse !== undefined) report.adminResponse = adminResponse;
    await report.save();
    res.status(200).json({
      success: true,
      message: `Report ${status}`,
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all bookings for admin (filter by status + pagination)
const getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("property", "title location images owner")
        .populate("tenant", "fullName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      bookings,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a booking's status (admin override)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking status" });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    booking.status = status;
    await booking.save();
    res.status(200).json({
      success: true,
      message: `Booking ${status}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    await booking.deleteOne();
    res.status(200).json({ success: true, message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all payments for admin (filter by status + pagination)
const getPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("tenant", "fullName email")
        .populate("landlord", "fullName email")
        .populate("property", "title location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      payments,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Override a payment's status (admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [
      "pending",
      "approved",
      "rejected",
      "successful",
      "failed",
      "refunded",
    ];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment status" });
    }
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    payment.status = status;
    await payment.save();
    res.status(200).json({
      success: true,
      message: `Payment ${status}`,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a payment
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    await payment.deleteOne();
    res.status(200).json({ success: true, message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all reviews for admin
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "fullName email")
      .populate("property", "title location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete any review (admin moderation)
const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change a user's role (admin). An admin cannot change their own role.
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["tenant", "landlord", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "You cannot change your own role" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.role = role;
    await user.save();
    res.status(200).json({
      success: true,
      message: `Role set to ${role}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enhanced admin dashboard stats
const getAdminOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTenants,
      totalLandlords,
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalBookings,
      pendingBookings,
      totalReviews,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "tenant" }),
      User.countDocuments({ role: "landlord" }),
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      Property.countDocuments({ status: "pending" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Review.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTenants,
        totalLandlords,
        totalProperties,
        approvedProperties,
        pendingProperties,
        totalBookings,
        pendingBookings,
        totalReviews,
        totalReports,
        pendingReports,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};

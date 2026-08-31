const Booking = require("../models/Booking");
const Property = require("../models/Property");

// Create a viewing request
const createBooking = async (req, res) => {
  try {
    const { propertyId, date, time, message } = req.body;

    if (!propertyId || !date) {
      return res.status(400).json({
        success: false,
        message: "Property and preferred date are required",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request a viewing for your own property",
      });
    }

    const booking = await Booking.create({
      property: propertyId,
      tenant: req.user._id,
      date,
      time,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Viewing request sent successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bookings made by the logged-in tenant
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id })
      .populate({ path: "property", populate: { path: "owner", select: "fullName phone" } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get viewing requests received on the logged-in landlord's properties
const getReceivedBookings = async (req, res) => {
  try {
    const myProperties = await Property.find({ owner: req.user._id }).select(
      "_id"
    );

    const bookings = await Booking.find({
      property: { $in: myProperties.map((p) => p._id) },
    })
      .populate("property", "title images price location")
      .populate("tenant", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking status (approve/reject by landlord, cancel by tenant)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking status" });
    }

    const booking = await Booking.findById(req.params.id).populate("property");
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const isLandlord =
      booking.property &&
      booking.property.owner.toString() === req.user._id.toString();
    const isTenant = booking.tenant.toString() === req.user._id.toString();

    // Landlord can approve/reject; tenant can only cancel
    if (["approved", "rejected"].includes(status) && !isLandlord && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the property owner can approve or reject a booking",
      });
    }

    if (status === "cancelled" && !isTenant && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the tenant can cancel a booking",
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getReceivedBookings,
  updateBookingStatus,
};

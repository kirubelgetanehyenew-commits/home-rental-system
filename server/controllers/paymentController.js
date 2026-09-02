const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// Submit a payment proof (screenshot) for an approved booking; landlord must approve
const createPayment = async (req, res) => {
  try {
    const { bookingId, method, transactionRef } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A payment screenshot is required as proof",
      });
    }

    const booking = await Booking.findById(bookingId).populate("property");
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    if (booking.tenant.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not your booking" });
    }
    if (booking.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can be paid",
      });
    }

    const payment = await Payment.create({
      booking: booking._id,
      tenant: booking.tenant,
      landlord: booking.property.owner,
      property: booking.property._id,
      amount: booking.property.price,
      method: method || "telebirr",
      transactionRef: transactionRef || `TXN-${Date.now()}`,
      screenshot: "/uploads/" + req.file.filename,
      status: "pending", // waits for landlord approval
    });

    await createNotification({
      user: booking.property.owner,
      title: "Payment proof submitted",
      body: `${payment.amount} ETB via ${payment.method} is awaiting your approval`,
      type: "payment",
      link: "/payments",
    });

    res.status(201).json({
      success: true,
      message: "Payment submitted, awaiting landlord approval",
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payments made by the logged-in tenant
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.user._id })
      .populate("property", "title location price")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payments received by the logged-in landlord
const getReceivedPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ landlord: req.user._id })
      .populate("property", "title location price")
      .populate("tenant", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Landlord approves a pending payment
const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      "property",
      "title"
    );
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    if (payment.landlord.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not your payment" });
    }
    if (payment.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Payment already processed" });
    }

    payment.status = "approved";
    await payment.save();

    await createNotification({
      user: payment.tenant,
      title: "Payment approved",
      body: `Your payment of ${payment.amount} ETB was approved`,
      type: "payment",
      link: "/payments",
    });

    res
      .status(200)
      .json({ success: true, message: "Payment approved", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Landlord rejects a pending payment
const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    if (payment.landlord.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not your payment" });
    }
    if (payment.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Payment already processed" });
    }

    payment.status = "rejected";
    payment.rejectReason = reason || "";
    await payment.save();

    await createNotification({
      user: payment.tenant,
      title: "Payment rejected",
      body: reason
        ? `Your payment was rejected: ${reason}`
        : `Your payment of ${payment.amount} ETB was rejected`,
      type: "payment",
      link: "/payments",
    });

    res
      .status(200)
      .json({ success: true, message: "Payment rejected", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// The logged-in user's own payment methods (landlord config)
const getMyPaymentMethods = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      paymentMethods: req.user.paymentMethods || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Landlord saves their available payment methods
const updateMyPaymentMethods = async (req, res) => {
  try {
    const { paymentMethods } = req.body;
    req.user.paymentMethods = Array.isArray(paymentMethods)
      ? paymentMethods
      : [];
    await req.user.save();
    res.status(200).json({
      success: true,
      message: "Payment methods saved",
      paymentMethods: req.user.paymentMethods,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// A landlord's available payment methods (read by tenants at checkout)
const getLandlordPaymentMethods = async (req, res) => {
  try {
    const landlord = await User.findById(req.params.landlordId);
    if (!landlord) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      paymentMethods: landlord.paymentMethods || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  getReceivedPayments,
  approvePayment,
  rejectPayment,
  getMyPaymentMethods,
  updateMyPaymentMethods,
  getLandlordPaymentMethods,
};

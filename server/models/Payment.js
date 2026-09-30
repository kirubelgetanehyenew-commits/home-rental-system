const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["booking", "premium"],
      default: "booking",
    },
    description: {
      type: String,
      default: "",
    },
    method: {
      type: String,
      enum: ["telebirr", "cbebirr", "bank_transfer", "card", "cash", "other"],
      default: "telebirr",
    },
    transactionRef: {
      type: String,
      default: "",
    },
    // Uploaded proof-of-payment image (tenant submits, landlord verifies)
    screenshot: {
      type: String,
      default: "",
    },
    rejectReason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "successful",
        "failed",
        "refunded",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);

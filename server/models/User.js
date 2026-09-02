const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["tenant", "landlord", "admin"],
      default: "tenant",
    },

    profileImage: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    // Payment accounts a landlord exposes to tenants (telebirr, bank, etc.)
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ["telebirr", "cbebirr", "bank_transfer", "cash", "other"],
          default: "telebirr",
        },
        label: { type: String, default: "" },
        accountName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
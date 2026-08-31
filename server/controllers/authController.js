const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Register User
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};

// Send email helper (falls back to logging the URL when SMTP not configured)
async function sendEmail({ to, subject, text, html }) {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    console.log("Email (dev) — to:", to);
    console.log("Subject:", subject);
    console.log("Text:", text);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: !!process.env.SMTP_SECURE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text, html });
}

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // respond 200 to avoid user enumeration
      return res.status(200).json({ success: true, message: "If that email exists, a reset link was sent" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

    const message = `You requested a password reset. Use the following link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, ignore.`;

    try {
      await sendEmail({ to: user.email, subject: "Password Reset", text: message });
    } catch (err) {
      console.error("Failed to send reset email:", err.message);
    }

    // For dev when SMTP not configured, return resetUrl
    const devResponse = process.env.SMTP_HOST ? {} : { resetUrl };

    res.status(200).json({ success: true, message: "Password reset link sent", ...devResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Invalid token" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: "Token is invalid or expired" });

    if (!password || password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.status(200).json({ success: true, message: "Password reset successful", token: jwtToken, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send verification email (for logged in users)
const sendVerification = async (req, res) => {
  try {
    const email = req.body.email || req.user?.email;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Email already verified" });

    const verifyToken = crypto.randomBytes(20).toString("hex");
    user.emailVerificationToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verifyToken}`;
    const message = `Verify your email by visiting:\n\n${verifyUrl}`;

    try {
      await sendEmail({ to: user.email, subject: "Verify your email", text: message });
    } catch (err) {
      console.error("Failed to send verification email:", err.message);
    }

    const devResponse = process.env.SMTP_HOST ? {} : { verifyUrl };
    res.status(200).json({ success: true, message: "Verification email sent", ...devResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) return res.status(400).json({ success: false, message: "Invalid token" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ emailVerificationToken: hashed });
    if (!user) return res.status(400).json({ success: false, message: "Token invalid or expired" });

    user.isVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout (client should remove token; endpoint kept for parity)
const logout = async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out" });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendVerification,
  verifyEmail,
  logout,
};
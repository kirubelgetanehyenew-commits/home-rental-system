const nodemailer = require("nodemailer");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { createNotification } = require("../controllers/notificationController");

function isTenancyExpired(booking) {
  if (!booking || booking.status !== "approved") return false;
  if (!booking.leaseEndDate) return false;

  const endTime = new Date(booking.leaseEndDate).getTime();
  if (Number.isNaN(endTime)) return false;

  return Date.now() >= endTime;
}

function buildExpiryMessage({ fullName, propertyTitle, endDate }) {
  const formattedDate = new Date(endDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `${fullName}, your rental for "${propertyTitle}" expired on ${formattedDate}. Please contact the other party to renew or finalize the tenancy.`;
}

async function sendPhoneAlert({ phone, message }) {
  if (!phone) {
    console.log(`[Phone alert skipped] ${message}`);
    return;
  }

  console.log(`[Phone alert to ${phone}] ${message}`);
}

async function sendEmailAlert({ email, subject, text }) {
  if (!email) {
    console.log(`[Email alert skipped] No email for: ${subject}`);
    return;
  }

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    console.log(`[Email alert dev] To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${text}`);
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

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
  });
}

async function checkExpiredTenancies() {
  const now = new Date();
  const expiredBookings = await Booking.find({
    status: "approved",
    leaseEndDate: { $ne: null, $lt: now },
    expiredNotified: { $ne: true },
  })
    .populate("tenant", "fullName email phone")
    .populate("property", "title owner");

  for (const booking of expiredBookings) {
    const propertyTitle = booking.property?.title || "rental property";
    const tenant = booking.tenant;
    const landlord = await User.findById(booking.property?.owner).select(
      "fullName email phone"
    );

    const endDate = booking.leaseEndDate || booking.date || new Date();

    const tenantMessage = buildExpiryMessage({
      fullName: tenant?.fullName || "Tenant",
      propertyTitle,
      endDate,
    });
    const landlordMessage = buildExpiryMessage({
      fullName: landlord?.fullName || "Landlord",
      propertyTitle: propertyTitle,
      endDate,
    });

    if (tenant) {
      await sendEmailAlert({
        email: tenant.email,
        subject: "Rental expiration notice",
        text: tenantMessage,
      });
      await sendPhoneAlert({ phone: tenant.phone, message: tenantMessage });
      await createNotification({
        user: tenant._id,
        title: "Rental expired",
        body: tenantMessage,
        type: "system",
        link: "/bookings",
      });
    }

    if (landlord) {
      await sendEmailAlert({
        email: landlord.email,
        subject: "Rental expiration notice",
        text: landlordMessage,
      });
      await sendPhoneAlert({ phone: landlord.phone, message: landlordMessage });
      await createNotification({
        user: landlord._id,
        title: "Rental expired",
        body: landlordMessage,
        type: "system",
        link: "/bookings",
      });
    }

    booking.status = "expired";
    booking.expiredNotified = true;
    await booking.save();
  }

  return expiredBookings.length;
}

module.exports = {
  isTenancyExpired,
  buildExpiryMessage,
  sendEmailAlert,
  sendPhoneAlert,
  checkExpiredTenancies,
};

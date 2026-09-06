// Create or promote an admin account (registration is locked to tenant/landlord,
// so admins must be provisioned separately).
//
// Usage:
//   npm run seed:admin -- <email> <password> [fullName]
//   node seedAdmin.js <email> <password> [fullName]
//
// If the email already exists, that user is promoted to admin and their
// password is reset to the one provided. Otherwise a new admin is created.

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB, disconnectDB } = require("./config/db");
const User = require("./models/User");

const [email, password, fullName] = process.argv.slice(2);

async function run() {
  if (!email || !password) {
    console.error("Usage: node seedAdmin.js <email> <password> [fullName]");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  await connectDB();

  const hashed = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    existing.password = hashed;
    existing.isSuspended = false;
    await existing.save();
    console.log(`✔ Promoted existing user ${email} to admin.`);
  } else {
    await User.create({
      fullName: fullName || "Administrator",
      email,
      password: hashed,
      role: "admin",
    });
    console.log(`✔ Created admin account ${email}.`);
  }

  console.log("You can now log in with this email and password.");
  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Seed failed:", err.message);
  try {
    await disconnectDB();
  } catch (_) {}
  process.exit(1);
});

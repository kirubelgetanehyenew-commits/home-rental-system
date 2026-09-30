require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");
const { checkExpiredTenancies } = require("./utils/tenancyExpiry");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  checkExpiredTenancies().catch((error) => {
    console.error("Initial expiry check failed:", error.message);
  });

  setInterval(() => {
    checkExpiredTenancies().catch((error) => {
      console.error("Scheduled expiry check failed:", error.message);
    });
  }, 60 * 1000);
});

// Start Server
app.listen(PORT, () => {
  console.log("==================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("==================================");
});
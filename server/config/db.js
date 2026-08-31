const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("==================================");
    console.log("✅ MongoDB Connected");
    console.log(`Database Host: ${conn.connection.host}`);
    console.log("==================================");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("==================================");
    console.log("✅ MongoDB Disconnected");
    console.log("==================================");
  } catch (error) {
    console.error("❌ MongoDB Disconnection Failed");
    console.error(error.message);
  }
};

const getDBConnection = () => mongoose.connection;

module.exports = { connectDB, disconnectDB, getDBConnection };
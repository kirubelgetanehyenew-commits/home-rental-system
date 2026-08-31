const { connectDB, disconnectDB } = require("./config/db");
require("dotenv").config();

const User = require("./models/User");

connectDB()
  .then(async () => {
    const users = await User.find();

    console.log(users);

    await disconnectDB();
    process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
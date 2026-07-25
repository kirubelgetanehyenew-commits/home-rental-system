const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("MongoDB Connected");

  const users = await User.find();

  console.log(users);

  process.exit();
});
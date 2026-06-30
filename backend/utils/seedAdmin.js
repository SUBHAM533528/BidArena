require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

(async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || "admin@auction.com";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", email);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || "Super Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "super_admin",
    });
    console.log("Super admin created:", email, "/ password:", process.env.ADMIN_PASSWORD || "Admin@123");
  }
  await mongoose.disconnect();
  process.exit(0);
})();

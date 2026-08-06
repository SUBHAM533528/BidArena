const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ role: "super_admin" });
    if (existing) {
      console.log("✅ Admin already exists:", existing.email);
      return;
    }
    const hashed = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "Admin@123",
      10
    );
    await User.create({
      name:     process.env.ADMIN_NAME     || "Super Admin",
      email:    process.env.ADMIN_EMAIL    || "admin@auctiongmail.com",
      password: hashed,
      role:     "super_admin",
      mobile:   "9861533528",
    });
    console.log("✅ Super admin created:", process.env.ADMIN_EMAIL || "admin@auction.com");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  }
};

module.exports = seedAdmin;
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ role: "super_admin" }).select("+password");

    if (!existing) {
      // Do NOT hash manually — the User model pre('save') hook does it
      await User.create({
        name:     process.env.ADMIN_NAME     || "Super Admin",
        email:    process.env.ADMIN_EMAIL    || "admin@auction.com",
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        role:     "super_admin",
        mobile:   "9861533528",
      });
      console.log("Super admin created:", process.env.ADMIN_EMAIL || "admin@auction.com");
      return;
    }

    console.log("Admin already exists:", existing.email);

    // Keep the existing admin's password in sync with ADMIN_PASSWORD on every
    // boot. This is what makes "change ADMIN_PASSWORD in Render → redeploy"
    // actually work as a password-reset mechanism — without this, seeding
    // only ever ran once, on the very first empty database.
    //
    // NOTE: this means ADMIN_PASSWORD in your env is the source of truth.
    // If you (or anyone) changes the password some other way (e.g. directly
    // in the database), the next redeploy/restart will silently overwrite
    // it back to whatever ADMIN_PASSWORD is currently set to.
    if (process.env.ADMIN_PASSWORD) {
      const matches = await existing.comparePassword(process.env.ADMIN_PASSWORD);
      if (!matches) {
        existing.password = process.env.ADMIN_PASSWORD;
        await existing.save();
        console.log("Admin password updated from ADMIN_PASSWORD env var:", existing.email);
      }
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }
};

module.exports = seedAdmin;
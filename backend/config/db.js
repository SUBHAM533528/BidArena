const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cricket_auction";
  const isAtlas = /mongodb(\+srv)?:\/\/.*\.mongodb\.net/.test(uri);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(` MongoDB connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    if (!isAtlas) console.log(`View data in MongoDB Compass: ${uri}`);
  } catch (err) {
    console.error("\n  MongoDB connection failed!");
    console.error(`    Error: ${err.message}`);
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (isAtlas) {
      console.error("  This is an Atlas (cloud) cluster — MongoDB isn't running");
      console.error("  locally, so check the cloud side instead:");
      console.error("  1. Atlas → Network Access → make sure your current IP is");
      console.error("     whitelisted (or temporarily allow 0.0.0.0/0 for dev).");
      console.error("  2. Atlas → Database → confirm the cluster isn't paused");
      console.error("     (free M0 clusters auto-pause after inactivity — click");
      console.error("     'Resume' if so).");
      console.error("  3. Double-check the username/password in MONGO_URI in");
      console.error("     your .env still match an active Database User.");
      console.error("  4. Check your own network/firewall/VPN isn't blocking");
      console.error("     outbound connections on port 27017.");
    } else {
      console.error("  Make sure MongoDB is running on your PC:");
      console.error("  Windows: press Win+R → type 'services.msc'");
      console.error("           find 'MongoDB' → right click → Start");
      console.error("  OR run:  net start MongoDB");
      console.error("\n  If MongoDB is not installed:");
      console.error("  https://www.mongodb.com/try/download/community");
      console.error("  (tick 'Install as Windows Service' during setup)");
    }
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () =>
  console.warn("MongoDB disconnected. Retrying...")
);
mongoose.connection.on("reconnected", () =>
  console.log("MongoDB reconnected.")
);

module.exports = connectDB;

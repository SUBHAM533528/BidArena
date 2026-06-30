const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cricket_auction";
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    console.log(`📦  Database: ${conn.connection.name}`);
    console.log(`🔭  View data in MongoDB Compass: ${uri}`);
  } catch (err) {
    console.error("\n❌  MongoDB connection failed!");
    console.error(`    Error: ${err.message}`);
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("  Make sure MongoDB is running on your PC:");
    console.error("  Windows: press Win+R → type 'services.msc'");
    console.error("           find 'MongoDB' → right click → Start");
    console.error("  OR run:  net start MongoDB");
    console.error("\n  If MongoDB is not installed:");
    console.error("  https://www.mongodb.com/try/download/community");
    console.error("  (tick 'Install as Windows Service' during setup)");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () =>
  console.warn("⚠️  MongoDB disconnected. Retrying...")
);
mongoose.connection.on("reconnected", () =>
  console.log("✅  MongoDB reconnected.")
);

module.exports = connectDB;

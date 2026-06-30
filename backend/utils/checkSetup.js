/**
 * Run this before starting the server to verify your setup:
 *   node utils/checkSetup.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];
let allGood = true;

console.log("\n🔍  StrikeZone Auctions — Setup Check\n");

// 1. Check .env vars
REQUIRED_VARS.forEach((key) => {
  const val = process.env[key];
  if (!val || val.includes("<") || val.includes("change_this")) {
    console.error(`  ❌  ${key} is not set (still has placeholder value)`);
    allGood = false;
  } else {
    console.log(`  ✅  ${key} is set`);
  }
});

if (!allGood) {
  console.error("\n  👉  Edit backend/.env and replace the placeholder values.\n");
  process.exit(1);
}

// 2. Test MongoDB connection
console.log("\n  🔌  Testing MongoDB connection...");
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log("  ✅  MongoDB connected successfully!\n");
    console.log("  🚀  You're good to go. Run: npm run seed && npm run dev\n");
    process.exit(0);
  })
  .catch((err) => {
    console.error(`  ❌  MongoDB connection failed: ${err.message}\n`);
    console.error("  Is your MONGO_URI correct? Check:");
    console.error("  • Atlas: username/password correct? IP whitelist set to 0.0.0.0/0?");
    console.error("  • Local: is mongod running? (run: net start MongoDB)\n");
    process.exit(1);
  });

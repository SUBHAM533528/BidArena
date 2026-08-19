require("dotenv").config();
const seedAdmin = require("./utils/seedAdmin");
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const registerAuctionSocket = require("./sockets/auctionSocket");

const authRoutes = require("./routes/authRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const teamRoutes = require("./routes/teamRoutes");
const playerRoutes = require("./routes/playerRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const bannerRoutes = require("./routes/bannerRoutes");

connectDB().then(() => {
  seedAdmin();
});

// A single bad/slow DB operation inside a route handler must not take down
// the whole process — log it and keep serving other requests instead of
// letting Node's default unhandled-rejection behaviour kill the server.
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection (server kept running):", err?.message || err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception (server kept running):", err?.message || err);
});

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
});

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      "http://localhost:5173",
      "https://bid-arena-77ie.vercel.app",
      "https://bid-arena-pvn77klmr-symondssubham-3807s-projects.vercel.app",
      process.env.CLIENT_URL,
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api/auth", limiter);
app.use("/api/players/register", limiter);
app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/auction", auctionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/banners", bannerRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Centralized error handler (multer errors, etc.)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

registerAuctionSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

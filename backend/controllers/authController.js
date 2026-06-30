const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendAuthResponse = (user, res, statusCode = 200) => {
  const token = signToken(user._id);
  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    })
    .json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        player: user.player,
      },
    });
};

// @route POST /api/auth/register   (team_owner or player self-signup)
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;
    const allowedSelfRoles = ["team_owner", "player"];
    const finalRole = allowedSelfRoles.includes(role) ? role : "player";

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, mobile, role: finalRole });
    sendAuthResponse(user, res, 201);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    sendAuthResponse(user, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

// @route PUT /api/auth/change-password  (protected)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Provide current password and a new password (min 6 chars)" });
    }
    const user = await User.findById(req.user._id).select("+password");
    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

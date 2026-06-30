const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe, logout, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.post(
  "/register",
  [body("email").isEmail(), body("password").isLength({ min: 6 }), body("name").notEmpty()],
  register
);
router.post("/login", [body("email").isEmail(), body("password").notEmpty()], login);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.put("/change-password", protect, changePassword);

module.exports = router;

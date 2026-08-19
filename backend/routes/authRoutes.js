const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe, logout, changePassword } = require("../controllers/authController");
const ah = require("../middleware/asyncHandler");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.post(
  "/register",
  [body("email").isEmail(), body("password").isLength({ min: 6 }), body("name").notEmpty()],
  ah(register)
);
router.post("/login", [body("email").isEmail(), body("password").notEmpty()], ah(login));
router.get("/me", protect, ah(getMe));
router.post("/logout", ah(logout));
router.put("/change-password", protect, ah(changePassword));

module.exports = router;

const express = require("express");
const ctrl = require("../controllers/notificationController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.get("/", protect, authorize("super_admin"), ah(ctrl.getNotifications));
router.patch("/:id/read", protect, authorize("super_admin"), ah(ctrl.markRead));
router.patch("/mark-all-read", protect, authorize("super_admin"), ah(ctrl.markAllRead));

module.exports = router;

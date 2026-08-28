const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/siteContentController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");

// Public
router.get("/:key", ah(ctrl.getContent));

// Admin only
router.put("/:key", protect, authorize("super_admin"), ah(ctrl.upsertContent));

module.exports = router;

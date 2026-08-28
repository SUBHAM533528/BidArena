const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/contactController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");

// Public — submit the Contact Us form
router.post("/", ah(ctrl.submitMessage));

// Admin only
router.get(   "/",     protect, authorize("super_admin"), ah(ctrl.getMessages));
router.patch( "/:id",  protect, authorize("super_admin"), ah(ctrl.updateStatus));
router.delete("/:id",  protect, authorize("super_admin"), ah(ctrl.deleteMessage));

module.exports = router;

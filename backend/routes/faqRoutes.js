const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/faqController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");

// Public
router.get("/public", ah(ctrl.getFaqs));

// Admin only
router.get(   "/",     protect, authorize("super_admin"), ah(ctrl.getAllFaqs));
router.post(  "/",     protect, authorize("super_admin"), ah(ctrl.createFaq));
router.put(   "/:id",  protect, authorize("super_admin"), ah(ctrl.updateFaq));
router.delete("/:id",  protect, authorize("super_admin"), ah(ctrl.deleteFaq));

module.exports = router;

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/bannerController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");
const upload  = require("../middleware/upload");

// Public
router.get("/public", ah(ctrl.getBanners));

// Admin only
router.get(   "/",     protect, authorize("super_admin"), ah(ctrl.getAllBanners));
router.post(  "/",     protect, authorize("super_admin"), upload("banners").single("image"), ah(ctrl.createBanner));
router.put(   "/:id",  protect, authorize("super_admin"), upload("banners").single("image"), ah(ctrl.updateBanner));
router.delete("/:id",  protect, authorize("super_admin"), ah(ctrl.deleteBanner));

module.exports = router;

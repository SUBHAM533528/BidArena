const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/bannerController");
const { protect, authorize } = require("../middleware/auth");
const upload  = require("../middleware/upload");

// Public
router.get("/public", ctrl.getBanners);

// Admin only
router.get(   "/",     protect, authorize("super_admin"), ctrl.getAllBanners);
router.post(  "/",     protect, authorize("super_admin"), upload("banners").single("image"), ctrl.createBanner);
router.put(   "/:id",  protect, authorize("super_admin"), upload("banners").single("image"), ctrl.updateBanner);
router.delete("/:id",  protect, authorize("super_admin"), ctrl.deleteBanner);

module.exports = router;

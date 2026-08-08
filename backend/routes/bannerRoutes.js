const express = require("express");
const ctrl = require("../controllers/bannerController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", ctrl.getBanners);
router.get("/:id", ctrl.getBanner);

router.post("/", protect, authorize("super_admin"), upload("banners").single("image"), ctrl.createBanner);
router.put("/:id", protect, authorize("super_admin"), upload("banners").single("image"), ctrl.updateBanner);
router.delete("/:id", protect, authorize("super_admin"), ctrl.deleteBanner);
router.patch("/:id/toggle-active", protect, authorize("super_admin"), ctrl.toggleActive);
router.patch("/reorder", protect, authorize("super_admin"), ctrl.reorderBanners);

module.exports = router;

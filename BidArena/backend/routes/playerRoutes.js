const express = require("express");
const ctrl = require("../controllers/playerController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

const playerUpload = upload("players").fields([
  { name: "photo", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
]);

router.post("/register", playerUpload, ctrl.registerPlayer);
router.get("/", protect, ctrl.getPlayers);
router.get("/:id", protect, ctrl.getPlayer);
router.put("/:id", protect, authorize("super_admin"), playerUpload, ctrl.updatePlayer);
router.delete("/:id", protect, authorize("super_admin"), ctrl.deletePlayer);
router.patch("/:id/status", protect, authorize("super_admin"), ctrl.setStatus);
router.patch("/:id/auction-eligible", protect, authorize("super_admin"), ctrl.setAuctionEligible);
router.patch("/:id/reset-auction-status", protect, authorize("super_admin"), ctrl.resetAuctionStatus);

module.exports = router;

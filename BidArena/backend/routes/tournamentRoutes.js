const express = require("express");
const ctrl = require("../controllers/tournamentController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", ctrl.getTournaments);
router.get("/:id", ctrl.getTournament);

router.post("/", protect, authorize("super_admin"), upload("tournaments").single("logo"), ctrl.createTournament);
router.put("/:id", protect, authorize("super_admin"), upload("tournaments").single("logo"), ctrl.updateTournament);
router.delete("/:id", protect, authorize("super_admin"), ctrl.deleteTournament);
router.patch("/:id/toggle-active", protect, authorize("super_admin"), ctrl.toggleActive);
router.patch("/:id/toggle-registration", protect, authorize("super_admin"), ctrl.toggleRegistration);

module.exports = router;

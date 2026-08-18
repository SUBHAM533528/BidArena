const express = require("express");
const ctrl = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.get("/stats",              protect, ctrl.getDashboardStats);
router.get("/bid-logs",           protect, ctrl.getBidLogs);
router.get("/sold-players/csv",   protect, authorize("super_admin"), ctrl.exportSoldPlayersCSV);

// PDF endpoints (admin only)
router.get("/pdf/all-players",    protect, authorize("super_admin"), ctrl.pdfAllPlayers);
router.get("/pdf/sold-players",   protect, authorize("super_admin"), ctrl.pdfSoldPlayers);
router.get("/pdf/unsold-players", protect, authorize("super_admin"), ctrl.pdfUnsoldPlayers);
router.get("/pdf/team/:teamId",   protect, authorize("super_admin"), ctrl.pdfTeamSquad);
router.get("/pdf/all-teams",      protect, authorize("super_admin"), ctrl.pdfAllTeams);

module.exports = router;

const express = require("express");
const ctrl = require("../controllers/teamController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", ctrl.getTeams);
router.get("/:id", ctrl.getTeam);

router.post("/", protect, authorize("super_admin"), upload("teams").single("logo"), ctrl.createTeam);
router.put("/:id", protect, authorize("super_admin"), upload("teams").single("logo"), ctrl.updateTeam);
router.delete("/:id", protect, authorize("super_admin"), ctrl.deleteTeam);

module.exports = router;

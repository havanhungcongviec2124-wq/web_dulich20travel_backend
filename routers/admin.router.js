const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/stats", protect, adminOnly, ctrl.stats);

module.exports = router;

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/activity.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, ctrl.list);
router.post("/", protect, adminOnly, ctrl.create);

module.exports = router;

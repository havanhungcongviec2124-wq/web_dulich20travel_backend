const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/service.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", ctrl.list);
router.get("/slug/:slug", ctrl.getBySlug);
router.get("/:id", ctrl.getById);
router.post("/", protect, adminOnly, ctrl.create);
router.put("/:id", protect, adminOnly, ctrl.update);
router.delete("/:id", protect, adminOnly, ctrl.remove);

module.exports = router;

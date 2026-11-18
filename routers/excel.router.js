const express = require("express");
const multer = require("multer");
const router = express.Router();
const ctrl = require("../controllers/excel.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(xlsx|xls|csv)$/i.test(file.originalname || "");
    if (!ok) return cb(new Error("Chỉ hỗ trợ file Excel (.xlsx, .xls, .csv)"));
    cb(null, true);
  },
});

router.get("/export", protect, adminOnly, ctrl.exportData);
router.post("/import", protect, adminOnly, upload.single("file"), ctrl.importData);

module.exports = router;

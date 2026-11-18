require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/config");

const authRouter = require("./routers/user.router");
const categoryRouter = require("./routers/category.router");
const serviceRouter = require("./routers/service.router");
const consultantRouter = require("./routers/consultant.router");
const locationRouter = require("./routers/location.router");
const contentRouter = require("./routers/content.router");
const pricingRouter = require("./routers/pricing.router");
const activityRouter = require("./routers/activity.router");
const adminRouter = require("./routers/admin.router");
const excelRouter = require("./routers/excel.router");

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Health
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "20 TRAVEL API đang hoạt động!",
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/services", serviceRouter);
app.use("/api/consultants", consultantRouter);
app.use("/api/locations", locationRouter);
app.use("/api/content", contentRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/activity-logs", activityRouter);
app.use("/api/admin", adminRouter);
app.use("/api/excel", excelRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Không tìm thấy endpoint." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Lỗi máy chủ.",
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Không thể khởi động Server:", error.message);
    process.exit(1);
  }
};

startServer();

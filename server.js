require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/config");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test API
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server đang hoạt động!",
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
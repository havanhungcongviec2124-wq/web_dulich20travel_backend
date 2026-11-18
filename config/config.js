
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("=================================");
    console.log("✅ KẾT NỐI MONGODB THÀNH CÔNG!");
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log("=================================");
  } catch (error) {
    console.error("=================================");
    console.error("❌ KHÔNG THỂ KẾT NỐI MONGODB!");
    console.error("Lỗi:", error.message);
    console.error("=================================");

    process.exit(1);
  }
};

module.exports = connectDB;

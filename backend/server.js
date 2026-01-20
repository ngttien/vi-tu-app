// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const db = require("./config/db");

// Import Routes tổng
const routes = require("./routes/index.route");

// Khởi tạo App
const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

// --- 1. MIDDLEWARE (Bộ lọc bảo vệ & Xử lý dữ liệu) ---
app.use(
  cors({
    origin: true,        // Cho phép mọi tên miền (sau này deploy sẽ sửa thành tên miền cụ thể)
    credentials: true,   // Cho phép gửi kèm cookie/token
  })
);

app.use(cookieParser()); // Đọc cookie từ trình duyệt
app.use(express.json()); // Đọc dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // Đọc dữ liệu từ Form HTML chuẩn

// --- 2. ROUTES (Định tuyến) ---
app.use("/api", routes);

// --- 3. KHỞI ĐỘNG SERVER ---
app.listen(port, '0.0.0.0',() => {
  console.log(`Server đang lắng nghe tại cổng ${port}`);
});
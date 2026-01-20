const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Kết nối Database Online (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Bắt buộc dòng này khi dùng Neon
  }
});

pool.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối:', err.message);
  } else {
    console.log(' Đã kết nối thành công tới Neon Database!');
  }
});

module.exports = pool;
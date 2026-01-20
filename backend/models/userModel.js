const pool = require('../config/db');

const User = {
  // Thay đổi từ create thành upsert để xử lý cả Thêm và Sửa
  upsert: async (data) => {
    // 1. Logic: Nếu trùng email thì cập nhật (Update), nếu chưa thì thêm mới (Insert)
    const sql = `
      INSERT INTO users (full_name, dob, tob, gender, goal, description, email) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      ON CONFLICT (email) 
      DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        dob = EXCLUDED.dob,
        tob = EXCLUDED.tob,
        gender = EXCLUDED.gender,
        goal = EXCLUDED.goal,
        description = EXCLUDED.description,
        created_at = NOW() -- Cập nhật lại thời gian tương tác mới nhất
      RETURNING *;
    `;
    
    // 2. Map đúng tên biến từ Frontend (App.jsx) gửi qua
    const values = [
      data.fullName, 
      data.dob, 
      data.tob, 
      data.gender, 
      data.goal, 
      data.note || '', // note từ frontend được lưu vào description trong DB
      data.email
    ];
    
    const result = await pool.query(sql, values);
    return result.rows[0];
  }
};

module.exports = User;
// backend/models/userModel.js
const pool = require('../config/db');

const User = {
  upsert: async (data) => {
    const sql = `
      INSERT INTO users (
        full_name, dob, tob, gender, goal, description, email, request_uuid, status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') 
      ON CONFLICT (email) 
      DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        dob = EXCLUDED.dob,
        tob = EXCLUDED.tob,
        gender = EXCLUDED.gender,
        goal = EXCLUDED.goal,
        description = EXCLUDED.description,
        request_uuid = EXCLUDED.request_uuid,
        status = 'pending', -- Reset trạng thái về pending để Robot quét lại
        created_at = NOW()
      RETURNING *;
    `;
    
    const values = [
      data.fullName, 
      data.dob, 
      data.tob, 
      data.gender, 
      data.goal, 
      data.note || '', 
      data.email,
      data.request_uuid 
    ];
    
    const result = await pool.query(sql, values);
    return result.rows[0];
  },

  // HÀM MỚI: Dành riêng cho con Robot (Worker) tìm người đang chờ
  findPending: async () => {
    const sql = `
      SELECT * FROM users 
      WHERE status = 'pending' 
      OR (status = 'processing' AND updated_at < NOW() - INTERVAL '5 minutes')
      ORDER BY created_at ASC 
      LIMIT 1;
    `;
    const result = await pool.query(sql);
    return result.rows[0];
  },
  updateStatus: async (id, status) => {
    const sql = `UPDATE users SET status = $2, updated_at = NOW() WHERE id = $1;`;
    await pool.query(sql, [id, status]);
  },

  // HÀM MỚI: Cập nhật kết quả sau khi Robot chat xong
  updateResult: async (id, aiResponse) => {
    const sql = `
      UPDATE users 
      SET ai_response = $2, status = 'done', updated_at = NOW() 
      WHERE id = $1;
    `;
    await pool.query(sql, [id, aiResponse]);
  }
};

module.exports = User;
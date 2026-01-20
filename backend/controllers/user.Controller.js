const pool = require("../config/db");
const { appendToSheet } = require("../utils/googleSheet");
const { sendSuccessEmail, sendResultEmail } = require("../utils/emailService"); // Thêm sendResultEmail
const aiService = require("../utils/aiService"); // Giả định file xử lý Gemini AI
const pdfService = require("../utils/pdfService");
const googleDriveService = require("../utils/googleDriveService");

exports.submitInfo = async (req, res) => {
  try {
    // 1. Nhận đủ dữ liệu (GIỮ NGUYÊN)
    const { fullName, dob, tob, gender, email, goal, note } = req.body;
    const description = note || ""; 

    console.log("=== Đang xử lý hồ sơ ===", email);

    // 2. Lệnh UPSERT (GIỮ NGUYÊN)
    const upsertQuery = `
      INSERT INTO users (full_name, dob, tob, gender, goal, description, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) 
      DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        dob = EXCLUDED.dob,
        tob = EXCLUDED.tob,
        gender = EXCLUDED.gender,
        goal = EXCLUDED.goal,
        description = EXCLUDED.description
      RETURNING *;
    `;

    const values = [fullName, dob, tob, gender, goal, description, email];
    const result = await pool.query(upsertQuery, values);
    const userData = result.rows[0];

    // 3. Đẩy sang Google Sheet & Gửi Mail 1 (GIỮ NGUYÊN)
    appendToSheet(req.body).catch(err => console.error("Lỗi Google Sheet:", err.message));
    
    // Gửi mail thông báo đã nhận thông tin (Mail 1)
    await sendSuccessEmail(email, fullName);

    // TRẢ VỀ PHẢN HỒI CHO FRONTEND NGAY ĐỂ NGƯỜI DÙNG KHÔNG PHẢI ĐỢI AI LUẬN GIẢI (Mất vài phút)
    res.status(200).json({
      success: true,
      message: "Hồ sơ đã ghi nhận! Vui lòng kiểm tra email sau vài phút để nhận bản luận giải AI.",
      data: userData
    });

    // --- LUỒNG XỬ LÝ AI & PDF CHẠY NGẦM (BACKGROUND PROCESS) ---
    // Chúng ta không dùng await cho cụm này để res.status ở trên được gửi đi ngay
    (async () => {
      try {
        console.log(`--- Đang bắt đầu luận giải AI cho: ${email} ---`);

        // A. Gọi Gemini AI lấy luận giải
        const aiResult = await aiService.generateInterpretation(userData);

        // B. Tạo PDF từ kết quả AI (Dùng Buffer để không tốn ổ cứng)
        const pdfBuffer = await pdfService.generateTửViPDF(userData, aiResult);

        // C. Upload lên Drive và lấy link
        const fileName = `TuVi_${fullName.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        const driveLink = await googleDriveService.uploadToDrive(pdfBuffer, fileName);

        // D. Cập nhật link Drive vào Database (Để quản lý sau này)
        const updateLinkQuery = `UPDATE users SET drive_pdf_link = $1 WHERE email = $2`;
        await pool.query(updateLinkQuery, [driveLink, email]);

        // E. Gửi Email 2 thông báo kết quả kèm Link PDF
        await sendResultEmail(email, fullName, driveLink);

        console.log(`--- Đã hoàn tất gửi bản luận giải cho: ${email} ---`);
      } catch (bgError) {
        console.error("Lỗi luồng xử lý AI/PDF ngầm:", bgError.message);
      }
    })();

  } catch (error) {
    console.error("Lỗi Controller:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Hệ thống đang bận!" });
    }
  }
};
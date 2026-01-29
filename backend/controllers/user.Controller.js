const { v4: uuidv4 } = require('uuid');
const User = require("../models/userModel"); 
const { appendToSheet } = require("../utils/googleSheet");
const { sendSuccessEmail } = require("../utils/emailService");

// --- CHỈ LÀM NHIỆM VỤ TIẾP NHẬN (LỄ TÂN) ---
exports.submitInfo = async (req, res) => {
  try {
    const { fullName, email, note } = req.body;
    const req_uuid = uuidv4();

    console.log(`\n=== [BƯỚC 1] TIẾP NHẬN HỒ SƠ: ${email} ===`);

    // 1. Lưu vào Database Neon
    // Trạng thái 'pending' cực kỳ quan trọng để con Robot (Worker) nhìn thấy đơn hàng này
    const userData = await User.upsert({ 
        ...req.body, 
        request_uuid: req_uuid,
        note: note || ""
    });

    // 2. Ghi Google Sheet (PENDING)
    // Con Robot Worker sau này sẽ tự vào đây đổi thành PROCESSING và DONE
    appendToSheet({ ...req.body, uuid: req_uuid, status: "PENDING" })
        .then(() => console.log(`>> [OK] Đã ghi danh lên Google Sheet trạng thái PENDING`))
        .catch(err => console.error(" Lỗi Google Sheet:", err.message));
    
    // 3. Gửi Email xác nhận "Đã nhận đơn"
    // Giúp khách hàng yên tâm là hệ thống đang xử lý
    sendSuccessEmail(email, fullName)
        .catch(err => console.error(" Lỗi gửi mail xác nhận:", err.message));

    // 4. TRẢ KẾT QUẢ VỀ FRONTEND NGAY LẬP TỨC
    // Web sẽ hiện thông báo thành công ngay, khách không phải đợi AI "rặn" chữ
    res.status(200).json({
      success: true,
      message: "Hồ sơ đã được tiếp nhận! Robot Gemini đang bắt đầu luận giải, kết quả sẽ gửi vào email của bạn sau ít phút.",
      data: { uuid: req_uuid }
    });

    console.log(`=== [XONG] Đã bàn giao hồ sơ cho Robot Worker xử lý ngầm ===\n`);

  } catch (error) {
    console.error(" Lỗi Controller chính:", error.message);
    if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi tiếp nhận hồ sơ" });
    }
  }
};
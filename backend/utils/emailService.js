// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// 1. Cấu hình tài khoản gửi (GIỮ NGUYÊN CỦA BẠN)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ngttien.3725@gmail.com', 
    pass: 'sjhw ncev dmbi zgbl'     
  }
});

// 2. Hàm gửi Mail 1: Xác nhận (GIỮ NGUYÊN HOÀN TOÀN)
const sendSuccessEmail = async (userEmail, fullName) => {
  const mailOptions = {
    from: '"Thuận Thời Hiếu Mệnh" <ngttien.3725@gmail.com>', 
    to: userEmail,
    subject: '✨ Xác nhận đăng ký luận giải Tử Vi thành công',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #d97706; text-align: center;">Xin chào ${fullName},</h2>
        <p>Cảm ơn bạn đã tin tưởng gửi thông tin tới <strong>Thuận Thời Hiểu Mệnh</strong>.</p>
        <p style="background-color: #f3f4f6; padding: 15px; border-radius: 5px;">
          Hồ sơ của bạn đã được hệ thống ghi nhận thành công.<br>
          Các chuyên gia và AI đang tiến hành phân tích lá số của bạn.
        </p>
        <p>Kết quả luận giải chi tiết sẽ được gửi lại qua email này trong thời gian sớm nhất.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">
          Đây là email tự động, vui lòng không trả lời email này.<br>
          Chúc bạn một ngày an lành!
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(">> Đã gửi mail thông báo tới: " + userEmail);
  } catch (error) {
    console.error(">> Lỗi gửi mail 1:", error.message);
  }
};

// 3. Hàm gửi Mail 2: Gửi kết quả (SỬA ĐỂ ĐÍNH KÈM FILE)
// Thay tham số driveLink bằng pdfBuffer
const sendResultEmail = async (userEmail, fullName, pdfBuffer) => {
  const mailOptions = {
    from: '"Thuận Thời Hiếu Mệnh" <ngttien.3725@gmail.com>',
    to: userEmail,
    subject: '📜 Kết quả luận giải Tử Vi của bạn đã sẵn sàng',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #d97706; text-align: center;">Chúc mừng ${fullName},</h2>
        
        <p>Bản luận giải Tử Vi kết hợp Trí tuệ nhân tạo dành riêng cho bạn đã hoàn thành.</p>
        
        <p style="text-align: center; font-weight: bold; font-size: 16px;">
           👉 MỜI BẠN MỞ FILE PDF ĐÍNH KÈM TRONG EMAIL NÀY ĐỂ XEM CHI TIẾT.
        </p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">
          Hy vọng bản luận giải này sẽ giúp ích cho hành trình của bạn.<br>
          <strong>Thuận Thời Hiếu Mệnh</strong>
        </p>
      </div>
    `,
    // --- THÊM PHẦN NÀY ĐỂ GỬI FILE ---
    attachments: [
        {
            filename: `Tu_Vi_Luan_Giai_${fullName.replace(/\s/g, '_')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(">> Đã gửi mail kết quả (kèm file) tới: " + userEmail);
  } catch (error) {
    console.error(">> Lỗi gửi mail 2:", error.message);
  }
};

module.exports = { 
  sendSuccessEmail, 
  sendResultEmail 
};
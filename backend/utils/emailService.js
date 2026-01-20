const nodemailer = require('nodemailer');

const sendSuccessEmail = async (userEmail, fullName) => {
  // 1. Cấu hình tài khoản gửi
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ngttien.3725@gmail.com', // Email của bạn
      pass: 'sjhw ncev dmbi zgbl'      // Mật khẩu ứng dụng 16 ký tự
    }
  });

  // 2. Nội dung email
  const mailOptions = {
    // QUAN TRỌNG: Email ở đây phải khớp với user ở trên
    from: '"Thuận Thời Hiểu Mệnh" <ngttien.3725@gmail.com>', 
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

  // 3. Tiến hành gửi
  try {
    await transporter.sendMail(mailOptions);
    console.log(">> Đã gửi mail thành công tới: " + userEmail);
  } catch (error) {
    console.error(">>  Lỗi gửi mail:", error.message);
  }
};

module.exports = { sendSuccessEmail };
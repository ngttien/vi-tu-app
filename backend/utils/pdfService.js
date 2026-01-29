// backend/utils/pdfService.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generatePDF = (userInfo, aiContent) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            let buffers = [];

            // 1. Đăng ký Font (Cả Regular và Bold)
            const fontRegular = path.join(__dirname, '../assets/fonts/BeVietnamPro-Regular.ttf');
            const fontBold = path.join(__dirname, '../assets/fonts/BeVietnamPro-Bold.ttf');

            // Kiểm tra font tồn tại để tránh crash server
            if (!fs.existsSync(fontRegular) || !fs.existsSync(fontBold)) {
                console.error("❌ Thiếu file font tại assets/fonts!");
            }

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // 2. Tiêu đề (Dùng font BOLD)
            doc.font(fontBold).fontSize(22).fillColor('#1a365d')
               .text('LÁ SỐ TỬ VI & LUẬN GIẢI AI', { align: 'center' });
            doc.moveDown();

            // 3. Thông tin khách hàng (Dùng font REGULAR cho nhãn, BOLD cho giá trị)
            doc.font(fontRegular).fontSize(12).fillColor('#000000');
            
            // Fix tên biến cho khớp với Frontend của bạn
            doc.text('Họ và tên: ', { continued: true }).font(fontBold).text(userInfo.fullName || 'N/A');
            doc.font(fontRegular).text('Ngày sinh: ', { continued: true }).font(fontBold).text(userInfo.dob || 'N/A');
            doc.font(fontRegular).text('Giờ sinh: ', { continued: true }).font(fontBold).text(userInfo.tob || 'N/A');
            doc.font(fontRegular).text('Giới tính: ', { continued: true }).font(fontBold).text(userInfo.gender === 'male' ? 'Nam' : 'Nữ');
            doc.moveDown();
            
            // Kẻ đường gạch ngang trang trí
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e1').stroke(); 
            doc.moveDown();

            // 4. Nội dung AI luận giải
            doc.font(fontBold).fontSize(16).fillColor('#1e40af').text('LUẬN GIẢI CHI TIẾT', { underline: true });
            doc.moveDown(0.5);
            
            // Xử lý nội dung AI (Gemini thường trả về string trực tiếp)
            const content = typeof aiContent === 'string' ? aiContent : (aiContent.luan_giai_tong_quan || "Đang cập nhật nội dung...");
            
            // In nội dung (Dùng font REGULAR cho dễ đọc)
            doc.font(fontRegular).fontSize(12).fillColor('#334155').text(content, { 
                align: 'justify',
                lineGap: 4
            });

            doc.end();

        } catch (error) {
            console.error("❌ Lỗi tạo PDF:", error);
            reject(error);
        }
    });
};

module.exports = { generatePDF };
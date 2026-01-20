// backend/utils/pdfService.js
const PDFDocument = require('pdfkit');
const path = require('path');

// --- CẤU HÌNH MÀU SẮC VÀ ĐƯỜNG DẪN ---
const COLORS = {
    GOLD: '#D4AF37',      // Màu vàng đồng sang trọng
    DARK_BLUE: '#003366', // Màu xanh đen chủ đạo
    TEXT_GRAY: '#333333', // Màu chữ nội dung
    RED_LOGO: '#E31E24'   // Màu đỏ của logo (nếu cần dùng làm điểm nhấn)
};

const ASSETS_PATH = path.join(__dirname, '../assets');
const FONTS = {
    REGULAR: path.join(ASSETS_PATH, 'fonts/BeVietnamPro-Regular.ttf'),
    BOLD: path.join(ASSETS_PATH, 'fonts/BeVietnamPro-Bold.ttf')
};
const IMAGES = {
    LOGO: path.join(ASSETS_PATH, 'images/logo-tp.png')
};

// --- HÀM HỖ TRỢ VẼ ---

// 1. Hàm vẽ khung viền bao quanh trang
const drawBorder = (doc) => {
    const margin = 20;
    doc.rect(margin, margin, doc.page.width - (margin * 2), doc.page.height - (margin * 2))
       .lineWidth(1.5)
       .strokeColor(COLORS.GOLD) // Viền màu vàng đồng
       .stroke();
};

// 2. Hàm vẽ Header (Chứa 2 thành phần bạn yêu cầu)
const drawHeader = (doc) => {
    const startY = 40;
    const centerX = doc.page.width / 2;

    // --- THÀNH PHẦN 1: LOGO (Hình ảnh bạn gửi) ---
    // Đặt logo ở giữa, phía trên cùng. Điều chỉnh width để to nhỏ tùy ý.
    doc.image(IMAGES.LOGO, centerX - 25, startY, { width: 50 });

    // --- THÀNH PHẦN 2: SLOGAN MẶC ĐỊNH (Văn bản bạn gửi) ---
    doc.moveDown(3.5); // Di chuyển con trỏ xuống dưới logo

    // Dòng tiêu đề lớn: Thuận Thời Hiếu Mệnh
    doc.font('BoldFont').fontSize(24).fillColor(COLORS.GOLD)
       .text('THUẬN THỜI HIẾU MỆNH', { align: 'center' });
    
    // Dòng phụ: Vạn Sự Hanh Thông
    doc.fontSize(16).text('Vạn Sự Hanh Thông', { align: 'center' });
    doc.moveDown(0.5);

    // Đoạn văn mô tả (Tái tạo lại từ hình ảnh số 2)
    doc.font('MainFont').fontSize(10).fillColor(COLORS.DARK_BLUE).text(
        'Khám phá bản đồ vận mệnh cá nhân thông qua sự kết hợp giữa tinh hoa cổ học và trí tuệ nhân tạo.\nNhận bản luận giải chi tiết về Đại Vận, Thần Số Học và lộ trình cải mệnh độc bản.',
        { align: 'center', lineGap: 3 }
    );

    // Vẽ một đường gạch ngang màu vàng để ngăn cách Header và Nội dung
    doc.moveDown(1);
    doc.moveTo(100, doc.y).lineTo(doc.page.width - 100, doc.y)
       .lineWidth(1).strokeColor(COLORS.GOLD).stroke();
};

// 3. Hàm vẽ Footer (Chân trang)
const drawFooter = (doc, pageNumber) => {
     // Lưu vị trí hiện tại
    const bottomY = doc.page.height - 50;
    
    doc.fontSize(8).fillColor(COLORS.TEXT_GRAY);
    
    // Vẽ đường kẻ mờ ở chân trang
    doc.moveTo(50, bottomY - 10).lineTo(doc.page.width - 50, bottomY - 10)
       .lineWidth(0.5).strokeColor('#CCCCCC').stroke();

    doc.text(
        `© ${new Date().getFullYear()} Tử Vi AI Project - Bản luận giải được hỗ trợ bởi Trí tuệ nhân tạo.`,
        50, bottomY, 
        { align: 'center', width: doc.page.width - 100 }
    );
    // Số trang (Nếu muốn)
    // doc.text(`Trang ${pageNumber}`, doc.page.width - 100, bottomY, { align: 'right' });
};


// --- HÀM CHÍNH: TẠO FILE PDF ---
const generateTửViPDF = (userData, aiContent) => {
    return new Promise((resolve, reject) => {
        // Khởi tạo document A4, lề trên dưới 50, trái phải 60
        const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 60, right: 60 } });
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Đăng ký Font tiếng Việt (RẤT QUAN TRỌNG)
        try {
            doc.registerFont('MainFont', FONTS.REGULAR);
            doc.registerFont('BoldFont', FONTS.BOLD);
        } catch (e) {
            console.error("Lỗi load font: Hãy đảm bảo bạn đã tải font vào thư mục assets/fonts");
            // Fallback nếu không có font (sẽ bị lỗi tiếng Việt)
            doc.font('Helvetica'); 
        }

        // --- BẮT ĐẦU VẼ NỘI DUNG TRANG 1 ---
        drawBorder(doc); // Vẽ khung
        drawHeader(doc); // Vẽ logo và slogan

        doc.moveDown(2); // Khoảng cách trước khi vào nội dung chính

        // --- PHẦN THÔNG TIN KHÁCH HÀNG (Ví dụ) ---
        doc.font('BoldFont').fontSize(14).fillColor(COLORS.DARK_BLUE)
           .text('THÔNG TIN CHỦ SỰ', { underline: true });
        doc.moveDown(0.5);
        doc.font('MainFont').fontSize(12).fillColor(COLORS.TEXT_GRAY);
        doc.text(`Họ và tên: ${userData.name}`, { indent: 20 });
        doc.text(`Ngày sinh (Dương lịch): ${userData.dob}`, { indent: 20 });
        // ... thêm các thông tin khác

        doc.moveDown(2);

        // --- PHẦN NỘI DUNG AI LUẬN GIẢI (Dynamic Content) ---
        doc.font('BoldFont').fontSize(14).fillColor(COLORS.DARK_BLUE)
           .text('CHI TIẾT LUẬN GIẢI', { underline: true });
        doc.moveDown(1);

        // In nội dung AI trả về
        doc.font('MainFont').fontSize(11).fillColor(COLORS.TEXT_GRAY).text(aiContent, {
            align: 'justify',
            paragraphGap: 10, // Khoảng cách giữa các đoạn văn
            lineGap: 4        // Khoảng cách giữa các dòng
        });

        // --- XỬ LÝ FOOTER CHO TẤT CẢ CÁC TRANG ---
        // Vì nội dung AI có thể dài nhiều trang, ta cần thêm footer và border cho từng trang
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            drawBorder(doc); // Vẽ lại khung cho các trang sau
            drawFooter(doc, i + 1); // Vẽ footer
        }

        doc.end();
    });
};

module.exports = { generateTửViPDF };
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { Solar } = require('lunar-javascript');
const creds = require('../config/service-account.json');

const SHEET_ID = '1QeO5b7Y3rNd0dufZ1zCNvwsISdtptifIqpUAjtfPG2M'; 

const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

// --- Má gom phần Auth lại dùng chung cho đỡ dài dòng ---
const getAuth = () => new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// HÀM 1: Ghi thông tin ban đầu khi khách nhấn nút (PENDING)
const appendToSheet = async (userData) => {
  try {
    const date = new Date(userData.dob);
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const namAm = lunar.getYear();
    const canChiTiengViet = `${CAN[namAm % 10]} ${CHI[namAm % 12]}`;

    const thongTinLich = `Dương (Âm: ${lunar.getDay()}/${lunar.getMonth()}/${lunar.getYear()} - ${canChiTiengViet})`;
    const thoiGianGui = new Date().toLocaleString('vi-VN');

    const doc = new GoogleSpreadsheet(SHEET_ID, getAuth());
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    const existingRow = rows.find(row => row.get('Email') === userData.email);

    const dataToSave = {
        'UUID': userData.uuid,
        'Họ tên': userData.fullName,
        'Ngày sinh': userData.dob,
        'Giờ sinh': userData.tob,
        'Giới tính': userData.gender === 'male' ? 'Nam' : 'Nữ',
        'Email': userData.email,
        'Mục tiêu': userData.goal,
        'Lịch': thongTinLich,
        'Trạng thái': userData.status || 'PENDING',
        'Ngày đăng ký': thoiGianGui
    };

    if (existingRow) {
        console.log(`>> Cập nhật Email trùng: ${userData.email}`);
        existingRow.assign(dataToSave);
        await existingRow.save();
    } else {
        console.log(">> Thêm mới vào Sheet...");
        await sheet.addRow(dataToSave);
    }
  } catch (error) {
    console.error(">> Lỗi Google Sheet (Append):", error.message);
  }
};

// --- HÀM 2: Má thêm vào để con Robot không báo lỗi "not a function" nữa ---
const updateSheetStatus = async (email, newStatus) => {
    try {
        const doc = new GoogleSpreadsheet(SHEET_ID, getAuth());
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        const rows = await sheet.getRows();
        // Tìm dòng có Email khớp với người đang xử lý
        const row = rows.find(r => r.get('Email') === email);

        if (row) {
            row.set('Trạng thái', newStatus); 
            await row.save();
            console.log(`✅ Đã đồng bộ Sheet: ${email} -> ${newStatus}`);
        } else {
            console.log(`⚠️ Không tìm thấy Email ${email} trên Sheet để cập nhật trạng thái.`);
        }
    } catch (error) {
        console.error(">> Lỗi Google Sheet (Update Status):", error.message);
    }
};

// --- PHẢI EXPORT CẢ 2 HÀM THẾ NÀY ROBOT MỚI THẤY ---
module.exports = { appendToSheet, updateSheetStatus };
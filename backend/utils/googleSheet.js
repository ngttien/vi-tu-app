const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { Solar } = require('lunar-javascript');
const creds = require('../config/service-account.json');

const SHEET_ID = '1QeO5b7Y3rNd0dufZ1zCNvwsISdtptifIqpUAjtfPG2M'; 

const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

const appendToSheet = async (userData) => {
  try {
    const date = new Date(userData.dob);
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const namAm = lunar.getYear();
    const canChiTiengViet = `${CAN[namAm % 10]} ${CHI[namAm % 12]}`;

    const thongTinLich = `Dương (Âm: ${lunar.getDay()}/${lunar.getMonth()}/${lunar.getYear()} - ${canChiTiengViet})`;
    const thoiGianGui = new Date().toLocaleString('vi-VN');

    const serviceAccountAuth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    const existingRow = rows.find(row => row.get('Email') === userData.email);

    // CHỈ GIỮ LẠI CÁC THÔNG TIN CẦN THIẾT
    const dataToSave = {
        'Họ tên': userData.fullName,
        'Lịch': thongTinLich,
        'Ngày sinh': userData.dob,
        'Giờ sinh': userData.tob,
        'Giới tính': userData.gender === 'male' ? 'Nam' : 'Nữ',
        'Mục tiêu': userData.goal, // Giữ lại Mục tiêu để tránh NULL
        'Email': userData.email,
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
    console.error(">> Lỗi Google Sheet:", error.message);
  }
};

module.exports = { appendToSheet };
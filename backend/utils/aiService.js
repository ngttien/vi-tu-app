// backend/utils/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

console.log("--> CHECK API KEY:", process.env.GEMINI_API_KEY ? "Đã có Key" : "Chưa có Key");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateTuVi = async (userData) => {
  try {
    // ===> SỬA DÒNG NÀY: Dùng "gemini-pro" là chắc chắn 100% chạy được <===
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // ======================================================================
    const prompt = `
      Đóng vai chuyên gia Tử Vi. Luận giải lá số cho:
      - Tên: ${userData.fullName}
      - Sinh: ${userData.dob} ${userData.tob}
      - Giới tính: ${userData.gender}
      - Mong muốn: ${userData.goal}
      
      Yêu cầu: Viết ngắn gọn, súc tích, tập trung vào lời khuyên.
    `;

    console.log("--> Đang gửi yêu cầu sang Gemini (Model: gemini-pro)...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text; 

  } catch (error) {
    console.error("Lỗi Gemini:", error.message); // In lỗi gọn hơn
    return null; 
  }
};

module.exports = { generateTuVi };
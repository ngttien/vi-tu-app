// backend/workers/geminiWorker.js
const { chromium } = require('playwright');
const path = require('path');
const User = require('../models/userModel');
const pdfService = require('../utils/pdfService');
const { sendResultEmail } = require('../utils/emailService');
const { updateSheetStatus } = require('../utils/googleSheet'); // <--- THÊM DÒNG NÀY

async function startGeminiWorker() {
    // ... (Giữ nguyên phần mở trình duyệt) ...
    const userDataDir = path.join(__dirname, '../../user_data');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: ['--start-maximized']
    });
    const page = await context.newPage();
    await page.goto('https://gemini.google.com/app');

    while (true) {
        try {
            const request = await User.findPending(); 

            if (request) {
                console.log(` Đang xử lý hồ sơ: ${request.email}`);
                
                // 1. Cập nhật DB & ĐỒNG BỘ SHEET sang PROCESSING
                await User.updateStatus(request.id, 'processing');
                await updateSheetStatus(request.email, 'PROCESSING'); // <--- THÊM DÒNG NÀY

                // ... (Phần chat với Gemini và tạo PDF giữ nguyên) ...
                const prompt = `Bạn là một chuyên gia tử vi...`; // logic prompt cũ
                const chatInput = 'div[contenteditable="true"]';
                await page.waitForSelector(chatInput);
                await page.fill(chatInput, prompt);
                await page.keyboard.press('Enter');

                const responseSelector = '.model-response-text';
                await page.waitForSelector(responseSelector, { timeout: 90000 });
                await page.waitForTimeout(5000); 
                const aiResult = await page.innerText(responseSelector);

                const aiDataForPDF = { luan_giai_tong_quan: aiResult };
                const userPdfData = {
                    fullName: request.full_name,
                    dob: request.dob,
                    tob: request.tob,
                    gender: request.gender === 'male' ? 'Nam' : 'Nữ'
                };

                const pdfBuffer = await pdfService.generatePDF(userPdfData, aiDataForPDF);
                await sendResultEmail(request.email, request.full_name, pdfBuffer);

                // 2. Cập nhật DB & ĐỒNG BỘ SHEET sang DONE
                await User.updateResult(request.id, aiResult);
                await updateSheetStatus(request.email, 'DONE'); // <--- THÊM DÒNG NÀY
                
                console.log(` ✅ Hoàn thành quy trình A-Z cho: ${request.email}`);
                await page.reload(); 
            } else {
                process.stdout.write(".");
            }
        } catch (error) {
            console.error(" Robot gặp sự cố:", error.message);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}
startGeminiWorker();
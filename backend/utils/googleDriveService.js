// backend/utils/googleDriveService.js
const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');

// --- 1. THÊM DÒNG NÀY ĐỂ ĐỌC FILE .ENV ---
require('dotenv').config(); 
// -----------------------------------------

const KEYFILEPATH = path.join(__dirname, '../config/service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

const uploadToDrive = async (fileBuffer, fileName) => {
    try {
        const fileMetadata = {
            name: fileName,
            // --- 2. SỬA DÒNG NÀY ĐỂ LẤY ID TỪ FILE .ENV ---
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], 
            // ----------------------------------------------
        };

        const media = {
            mimeType: 'application/pdf',
            body: Readable.from(fileBuffer),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        // Cấp quyền xem cho bất kỳ ai có link
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return response.data.webViewLink; 
    } catch (error) {
        console.error('Lỗi Upload Drive:', error);
        throw error;
    }
};

module.exports = { uploadToDrive };
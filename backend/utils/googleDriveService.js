const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');

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
            parents: ['ID_THU_MUC_GOOGLE_DRIVE_CUA_BAN'], // Thay bằng ID folder trên Drive
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

        // Cấp quyền xem cho bất kỳ ai có link (để gửi mail khách xem được ngay)
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return response.data.webViewLink; // Trả về link file
    } catch (error) {
        console.error('Lỗi Upload Drive:', error);
        throw error;
    }
};

module.exports = { uploadToDrive };
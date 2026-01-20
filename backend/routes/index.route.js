// backend/routes/index.route.js
const express = require('express');
const router = express.Router();

// Import các route con
const userRoute = require('./user.route');

// Gắn route con vào hệ thống
// Đường dẫn lúc này sẽ ghép lại thành: /user/submit
router.use('/user', userRoute);

// Sau này có thêm product thì thêm dòng dưới:
// router.use('/product', productRoute);

module.exports = router;
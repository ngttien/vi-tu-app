// backend/routes/user.route.js
const express = require('express');
const router = express.Router();
//const userController = require('../controllers/user.Controller');
const userController = require ('../controllers/user.Controller')
// Định nghĩa: POST /submit
router.post('/submit', userController.submitInfo);

module.exports = router;
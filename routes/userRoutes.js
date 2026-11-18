const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All user routes require authentication

router.put('/me', userController.updateMe);
router.put('/me/password', userController.updatePassword);
router.put('/me/settings', userController.updateSettings);

module.exports = router;

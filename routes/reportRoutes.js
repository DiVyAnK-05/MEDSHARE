const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { submitLimiter } = require('../middleware/rateLimit');

router.post('/', protect, submitLimiter, reportController.createReport);

module.exports = router;

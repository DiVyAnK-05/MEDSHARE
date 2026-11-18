const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { submitLimiter } = require('../middleware/rateLimit');

router.post('/', submitLimiter, contactController.submitContact);

module.exports = router;

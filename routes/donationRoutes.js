const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { submitLimiter } = require('../middleware/rateLimit');

// All donation management routes require authentication
router.use(protect);

router.post('/', submitLimiter, upload.single('photo'), donationController.createDonation);
router.get('/mine', donationController.getMyDonations);
router.delete('/:id', donationController.cancelDonation);

module.exports = router;

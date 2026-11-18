const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// Public route to browse verified medicines
router.get('/', donationController.getPublicMedicines);

// Public route to view single verified medicine detail
router.get('/:id', donationController.getMedicineById);

module.exports = router;

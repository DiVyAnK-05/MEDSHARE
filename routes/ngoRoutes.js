const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { submitLimiter } = require('../middleware/rateLimit');

router.get('/', ngoController.getNgos);
router.post('/apply', submitLimiter, ngoController.applyNgo);

module.exports = router;

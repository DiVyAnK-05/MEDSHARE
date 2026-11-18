const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { submitLimiter } = require('../middleware/rateLimit');

router.use(protect);

router.post('/', submitLimiter, requestController.createRequest);
router.get('/mine', requestController.getMyRequests);
router.put('/:id/cancel', requestController.cancelRequest);

module.exports = router;

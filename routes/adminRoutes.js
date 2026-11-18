const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// All admin routes strictly require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminController.getAdminStats);

router.get('/donations', adminController.getAdminDonations);
router.put('/donations/:id/verify', adminController.verifyDonation);
router.put('/donations/:id/reject', adminController.rejectDonation);

router.get('/requests', adminController.getAdminRequests);
router.put('/requests/:id/status', adminController.updateRequestStatus);

router.get('/users', adminController.getAdminUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

router.get('/ngo-applications', adminController.getAdminNgoApplications);
router.put('/ngo-applications/:id', adminController.reviewNgoApplication);

router.get('/reports', adminController.getAdminReports);

router.get('/contact-messages', adminController.getAdminContactMessages);
router.put('/contact-messages/:id/status', adminController.updateContactMessageStatus);
router.delete('/contact-messages/:id', adminController.deleteContactMessage);

module.exports = router;

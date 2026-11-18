const Report = require('../models/Report');
const Donation = require('../models/Donation');

// @desc    Report a medicine donation for safety or fraud concerns
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    const { donationId, reason, details } = req.body;

    if (!donationId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Donation ID and reason are required'
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetDonation: donationId,
      reason,
      details: details ? details.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our safety team will investigate this donation promptly.',
      data: { report }
    });
  } catch (err) {
    next(err);
  }
};

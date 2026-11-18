const Request = require('../models/Request');
const Donation = require('../models/Donation');
const { generateRequestCode } = require('../utils/helpers');
const { createNotification } = require('../services/notificationService');
const { REQUEST_STATUS, DONATION_STATUS } = require('../config/constants');

// @desc    Submit a request for medicine
// @route   POST /api/requests
// @access  Private (Receiver, NGO, Admin)
exports.createRequest = async (req, res, next) => {
  try {
    const { donationId, quantity, reason, contactMethod } = req.body;

    if (!donationId || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Donation ID, quantity, and reason are required'
      });
    }

    const requestedQty = Number(quantity);
    if (requestedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity must be at least 1'
      });
    }

    // Find the donation
    const donation = await Donation.findById(donationId).populate('donor');
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Medicine record not found'
      });
    }

    if (donation.status !== DONATION_STATUS.VERIFIED) {
      return res.status(400).json({
        success: false,
        message: 'This medicine is not currently available for requests.'
      });
    }

    if (donation.availableQuantity < requestedQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${donation.availableQuantity} ${donation.unit} available. Cannot request ${requestedQty}.`
      });
    }

    // Check for existing pending request by this user
    const existingPending = await Request.findOne({
      receiver: req.user._id,
      donation: donationId,
      status: REQUEST_STATUS.PENDING
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this medicine donation.'
      });
    }

    // Cannot request own donation
    if (donation.donor._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own medicine donation.'
      });
    }

    // Deduct available quantity
    donation.availableQuantity -= requestedQty;
    if (donation.availableQuantity === 0) {
      donation.status = DONATION_STATUS.MATCHED;
    }
    await donation.save();

    const requestCode = generateRequestCode();
    const request = await Request.create({
      requestCode,
      receiver: req.user._id,
      donation: donation._id,
      quantity: requestedQty,
      reason: reason.trim(),
      contactMethod: contactMethod || 'in_app',
      status: REQUEST_STATUS.PENDING
    });

    // Notify receiver
    await createNotification(
      req.user._id,
      'Request Submitted',
      `Your request (${requestCode}) for ${requestedQty} ${donation.unit} of ${donation.medicineName} has been submitted for coordination.`,
      'request_update',
      '/pages/dashboard.html'
    );

    // Notify donor
    await createNotification(
      donation.donor._id,
      'New Medicine Request',
      `A verified receiver has requested ${requestedQty} ${donation.unit} of your donated ${donation.medicineName}. MedShare volunteers are coordinating handover.`,
      'request_update',
      '/pages/dashboard.html'
    );

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully. You will be notified once coordinated.',
      data: { request }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get requests made by the logged in user
// @route   GET /api/requests/mine
// @access  Private
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ receiver: req.user._id })
      .populate({
        path: 'donation',
        select: 'medicineName genericName category unit expiryDate locality handoverMethod pickupAddress status photoPath'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: { requests }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a pending request
// @route   PUT /api/requests/:id/cancel
// @access  Private
exports.cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this request' });
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled.'
      });
    }

    // Restore available quantity to donation
    const donation = await Donation.findById(request.donation);
    if (donation) {
      donation.availableQuantity += request.quantity;
      if (donation.status === DONATION_STATUS.MATCHED) {
        donation.status = DONATION_STATUS.VERIFIED;
      }
      await donation.save();
    }

    request.status = REQUEST_STATUS.CANCELLED;
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully. Quantity released back to inventory.'
    });
  } catch (err) {
    next(err);
  }
};

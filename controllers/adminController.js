const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Ngo = require('../models/Ngo');
const NgoApplication = require('../models/NgoApplication');
const Report = require('../models/Report');
const ContactMessage = require('../models/ContactMessage');
const { createNotification } = require('../services/notificationService');
const { DONATION_STATUS, REQUEST_STATUS } = require('../config/constants');
const { sanitizeUser } = require('../utils/helpers');

// @desc    Get system-wide metrics and stats for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: DONATION_STATUS.PENDING });
    const verifiedDonations = await Donation.countDocuments({ status: DONATION_STATUS.VERIFIED });
    const activeRequests = await Request.countDocuments({ status: REQUEST_STATUS.PENDING });
    const handedOverCount = await Donation.countDocuments({ status: DONATION_STATUS.HANDED_OVER });
    const verifiedNgos = await Ngo.countDocuments({ isVerified: true });
    const pendingNgoApps = await NgoApplication.countDocuments({ status: 'Pending' });
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const totalContactMessages = await ContactMessage.countDocuments();
    const unreadContactMessages = await ContactMessage.countDocuments({ status: 'Unread' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDonations,
        pendingDonations,
        verifiedDonations,
        activeRequests,
        handedOverCount,
        verifiedNgos,
        pendingNgoApps,
        pendingReports,
        totalContactMessages,
        unreadContactMessages
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get donations with optional status filter for verification queue
// @route   GET /api/admin/donations
// @access  Private (Admin only)
exports.getAdminDonations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const donations = await Donation.find(filter)
      .populate('donor', 'name email phone locality')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: { donations }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve/Verify a pending donation
// @route   PUT /api/admin/donations/:id/verify
// @access  Private (Admin only)
exports.verifyDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.status = DONATION_STATUS.VERIFIED;
    donation.verifiedBy = req.user._id;
    donation.verifiedAt = new Date();
    donation.rejectionReason = '';
    await donation.save();

    // Notify donor
    await createNotification(
      donation.donor,
      'Donation Verified & Approved',
      `Your donation of ${donation.medicineName} (${donation.donationCode}) has passed our safety review and is now live for community requests!`,
      'verification',
      '/pages/dashboard.html'
    );

    res.status(200).json({
      success: true,
      message: 'Donation verified successfully and published to community directory',
      data: { donation }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject a pending donation with reason
// @route   PUT /api/admin/donations/:id/reject
// @access  Private (Admin only)
exports.rejectDonation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A clear rejection reason is required for safety auditing'
      });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.status = DONATION_STATUS.REJECTED;
    donation.rejectionReason = reason.trim();
    donation.verifiedBy = req.user._id;
    donation.verifiedAt = new Date();
    await donation.save();

    // Notify donor
    await createNotification(
      donation.donor,
      'Donation Rejected by Safety Review',
      `Your donation of ${donation.medicineName} could not be approved. Reason: ${reason.trim()}`,
      'verification',
      '/pages/dashboard.html'
    );

    res.status(200).json({
      success: true,
      message: 'Donation rejected and donor notified',
      data: { donation }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all requests across the platform
// @route   GET /api/admin/requests
// @access  Private (Admin only)
exports.getAdminRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await Request.find(filter)
      .populate('receiver', 'name email phone locality')
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name email phone locality' }
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

// @desc    Update request status (Approve, Fulfill/Handed Over, Reject)
// @route   PUT /api/admin/requests/:id/status
// @access  Private (Admin only)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!Object.values(REQUEST_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(REQUEST_STATUS).join(', ')}`
      });
    }

    const request = await Request.findById(req.params.id)
      .populate('receiver')
      .populate({
        path: 'donation',
        populate: { path: 'donor' }
      });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const previousStatus = request.status;
    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes.trim();
    await request.save();

    // If fulfilled, mark donation as Handed Over if availableQuantity is 0
    if (status === REQUEST_STATUS.FULFILLED && request.donation) {
      if (request.donation.availableQuantity === 0) {
        request.donation.status = DONATION_STATUS.HANDED_OVER;
        await request.donation.save();
      }
    }

    // If rejected, restore quantity to donation
    if (status === REQUEST_STATUS.REJECTED && previousStatus !== REQUEST_STATUS.REJECTED) {
      if (request.donation) {
        request.donation.availableQuantity += request.quantity;
        if (request.donation.status === DONATION_STATUS.MATCHED) {
          request.donation.status = DONATION_STATUS.VERIFIED;
        }
        await request.donation.save();
      }
    }

    // Notify receiver
    await createNotification(
      request.receiver._id,
      `Request Status Updated: ${status}`,
      `Your request (${request.requestCode}) for ${request.donation.medicineName} is now ${status}. ${adminNotes || ''}`,
      'request_update',
      '/pages/dashboard.html'
    );

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      data: { request }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const sanitized = users.map(sanitizeUser);

    res.status(200).json({
      success: true,
      count: sanitized.length,
      data: { users: sanitized }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active status (deactivate / reactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account.'
      });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { user: sanitizeUser(user) }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get NGO partner applications
// @route   GET /api/admin/ngo-applications
// @access  Private (Admin only)
exports.getAdminNgoApplications = async (req, res, next) => {
  try {
    const applications = await NgoApplication.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: applications.length,
      data: { applications }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Review and approve/reject NGO application
// @route   PUT /api/admin/ngo-applications/:id
// @access  Private (Admin only)
exports.reviewNgoApplication = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const app = await NgoApplication.findById(req.params.id);

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    app.status = status;
    if (notes) app.adminNotes = notes;
    await app.save();

    // If approved, create verified NGO record
    if (status === 'Approved') {
      const existingNgo = await Ngo.findOne({ registrationNumber: app.registrationNumber });
      if (!existingNgo) {
        await Ngo.create({
          name: app.organizationName,
          area: app.operatingAreas.join(', '),
          registrationNumber: app.registrationNumber,
          collectionPoints: [
            {
              name: `${app.organizationName} - Main Drop-off Desk`,
              address: app.officialAddress,
              contactPerson: app.contactPerson,
              phone: app.phone
            }
          ],
          workingHours: '10:00 AM - 5:00 PM (Monday to Saturday)',
          contact: {
            email: app.email,
            phone: app.phone,
            website: ''
          },
          isVerified: true
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `NGO application marked as ${status}`,
      data: { application: app }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get safety reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getAdminReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate({
        path: 'targetDonation',
        select: 'donationCode medicineName category photoPath status'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: { reports }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact inquiries & messages
// @route   GET /api/admin/contact-messages
// @access  Private (Admin only)
exports.getAdminContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      data: { messages }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contact message status (Unread, Read, Replied)
// @route   PUT /api/admin/contact-messages/:id/status
// @access  Private (Admin only)
exports.updateContactMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({
      success: true,
      message: `Message status updated to ${status}`,
      data: { message }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete contact message
// @route   DELETE /api/admin/contact-messages/:id
// @access  Private (Admin only)
exports.deleteContactMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

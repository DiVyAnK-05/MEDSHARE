const Donation = require('../models/Donation');
const { validateMedicineSafety } = require('../utils/safetyValidator');
const { generateDonationCode, maskPhoneNumber } = require('../utils/helpers');
const { createNotification } = require('../services/notificationService');
const { DONATION_STATUS } = require('../config/constants');

// @desc    Submit a new medicine donation
// @route   POST /api/donations
// @access  Private (Donor, NGO, Admin)
exports.createDonation = async (req, res, next) => {
  try {
    const {
      medicineName,
      genericName,
      category,
      quantity,
      unit,
      batchNumber,
      expiryDate,
      sealedPackaging,
      locality,
      pickupAddress,
      handoverMethod
    } = req.body;

    // Check if photo uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'A clear photo of the sealed medicine packaging showing batch number and expiry date is required.'
      });
    }

    // Safety validation
    const safetyCheck = validateMedicineSafety({
      medicineName,
      genericName,
      expiryDate,
      sealedPackaging: sealedPackaging === 'true' || sealedPackaging === true,
      quantity,
      unit
    });

    if (!safetyCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: safetyCheck.errors[0],
        errors: safetyCheck.errors
      });
    }

    const photoPath = `/uploads/${req.file.filename}`;
    const donationCode = generateDonationCode();

    const donation = await Donation.create({
      donor: req.user._id,
      donationCode,
      medicineName: medicineName.trim(),
      genericName: genericName.trim(),
      category,
      quantity: Number(quantity),
      availableQuantity: Number(quantity),
      unit,
      batchNumber: batchNumber.trim(),
      expiryDate: new Date(expiryDate),
      sealedPackaging: true,
      photoPath,
      locality: locality.trim(),
      pickupAddress: pickupAddress.trim(),
      handoverMethod: handoverMethod || 'dropoff_at_ngo',
      status: DONATION_STATUS.PENDING
    });

    // Notify donor
    await createNotification(
      req.user._id,
      'Donation Submitted for Verification',
      `Your donation of ${medicineName} (${donationCode}) has been received and queued for safety verification by our volunteer team.`,
      'verification',
      '/pages/dashboard.html'
    );

    res.status(201).json({
      success: true,
      message: 'Donation submitted successfully. It is now pending safety verification.',
      data: { donation }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get donations submitted by the logged in user
// @route   GET /api/donations/mine
// @access  Private
exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
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

// @desc    Get public verified medicines with search, filter, sort, and pagination
// @route   GET /api/medicines
// @access  Public
exports.getPublicMedicines = async (req, res, next) => {
  try {
    const {
      search,
      category,
      locality,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    const query = {
      status: DONATION_STATUS.VERIFIED,
      availableQuantity: { $gt: 0 },
      expiryDate: { $gt: new Date() } // Must not be expired
    };

    // Text search on medicine name and generic name
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { medicineName: searchRegex },
        { genericName: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Locality filter
    if (locality && locality !== 'All') {
      query.locality = new RegExp(locality.trim(), 'i');
    }

    // Sorting
    let sortOptions = { expiryDate: 1 }; // Default: expiring soonest first
    if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === 'quantity_desc') {
      sortOptions = { availableQuantity: -1 };
    } else if (sortBy === 'name_asc') {
      sortOptions = { medicineName: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Donation.countDocuments(query);
    const medicines = await Donation.find(query)
      .populate('donor', 'name locality')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Sanitize medicine cards to preserve privacy (hide exact pickup addresses for unauthenticated public)
    const sanitizedMedicines = medicines.map((med) => {
      const obj = med.toObject();
      return {
        _id: obj._id,
        donationCode: obj.donationCode,
        medicineName: obj.medicineName,
        genericName: obj.genericName,
        category: obj.category,
        quantity: obj.quantity,
        availableQuantity: obj.availableQuantity,
        unit: obj.unit,
        batchNumber: obj.batchNumber,
        expiryDate: obj.expiryDate,
        photoPath: obj.photoPath,
        locality: obj.locality,
        status: obj.status,
        handoverMethod: obj.handoverMethod,
        donor: {
          name: obj.donor ? obj.donor.name : 'Verified Community Donor',
          locality: obj.donor ? obj.donor.locality : obj.locality
        },
        createdAt: obj.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: sanitizedMedicines.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
        totalCount
      },
      data: { medicines: sanitizedMedicines }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single verified medicine details
// @route   GET /api/medicines/:id
// @access  Public
exports.getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Donation.findById(req.params.id)
      .populate('donor', 'name locality createdAt');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine record not found'
      });
    }

    // Only allow verified or owner/admin viewing
    const isOwner = req.user && req.user._id.toString() === medicine.donor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (medicine.status !== DONATION_STATUS.VERIFIED && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'This medicine donation is currently under verification and not yet publicly viewable.'
      });
    }

    res.status(200).json({
      success: true,
      data: { medicine }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a pending donation
// @route   DELETE /api/donations/:id
// @access  Private (Donor owner or Admin)
exports.cancelDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this donation' });
    }

    if (donation.status === DONATION_STATUS.HANDED_OVER || donation.status === DONATION_STATUS.MATCHED) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a donation that is already matched or handed over'
      });
    }

    donation.status = DONATION_STATUS.REJECTED;
    donation.rejectionReason = 'Cancelled by donor';
    await donation.save();

    res.status(200).json({
      success: true,
      message: 'Donation cancelled successfully'
    });
  } catch (err) {
    next(err);
  }
};

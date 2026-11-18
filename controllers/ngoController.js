const Ngo = require('../models/Ngo');
const NgoApplication = require('../models/NgoApplication');

// @desc    Get all verified NGOs
// @route   GET /api/ngos
// @access  Public
exports.getNgos = async (req, res, next) => {
  try {
    const ngos = await Ngo.find({ isVerified: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: ngos.length,
      data: { ngos }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit application to become an NGO partner
// @route   POST /api/ngo-applications
// @access  Public
exports.applyNgo = async (req, res, next) => {
  try {
    const {
      organizationName,
      registrationNumber,
      contactPerson,
      email,
      phone,
      operatingAreas,
      officialAddress,
      missionStatement
    } = req.body;

    if (!organizationName || !registrationNumber || !contactPerson || !email || !phone || !officialAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required organization and contact details'
      });
    }

    // Split areas if comma-separated string
    let areasArray = operatingAreas;
    if (typeof operatingAreas === 'string') {
      areasArray = operatingAreas.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const application = await NgoApplication.create({
      organizationName: organizationName.trim(),
      registrationNumber: registrationNumber.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      operatingAreas: areasArray && areasArray.length > 0 ? areasArray : ['Ghaziabad'],
      officialAddress: officialAddress.trim(),
      missionStatement: missionStatement ? missionStatement.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'NGO Partner application submitted successfully. Our compliance team will review your registration.',
      data: { application }
    });
  } catch (err) {
    next(err);
  }
};

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sanitizeUser } = require('../utils/helpers');

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, locality } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (locality) updateData.locality = locality.trim();

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: sanitizeUser(updatedUser)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/users/me/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const user = await User.findById(req.user.id).select('+passwordHash');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update accessibility & notification settings
// @route   PUT /api/users/me/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const { textSize, highContrast, reducedMotion, emailNotifications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.settings) user.settings = {};

    if (textSize !== undefined) user.settings.textSize = textSize;
    if (highContrast !== undefined) user.settings.highContrast = Boolean(highContrast);
    if (reducedMotion !== undefined) user.settings.reducedMotion = Boolean(reducedMotion);
    if (emailNotifications !== undefined) user.settings.emailNotifications = Boolean(emailNotifications);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences saved',
      data: {
        settings: user.settings
      }
    });
  } catch (err) {
    next(err);
  }
};

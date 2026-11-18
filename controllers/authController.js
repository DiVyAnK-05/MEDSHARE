const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sanitizeUser } = require('../utils/helpers');
const { sendPasswordResetEmail } = require('../services/emailService');

// Helper to generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medshare_super_secret_jwt_key_2026_kiet_ghaziabad_pilot', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Helper to send JWT cookie and response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  const cookieDays = parseInt(process.env.COOKIE_EXPIRES_DAYS, 10) || 7;

  const cookieOptions = {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('medshare_token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    token, // Also send token for flexibility
    data: {
      user: sanitizeUser(user)
    }
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, role, locality, password } = req.body;

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in or use forgot password.'
      });
    }

    // Creator team emails and demo admin email are granted admin role
    let userRole = role || 'donor';
    const normalizedEmail = email.toLowerCase().trim();
    const adminEmails = [
      'jhadivyank7@gmail.com',
      '2628mca0300@kiet.edu',
      '2628mca0010@kiet.edu',
      'admin@medshare.org'
    ];
    if (adminEmails.includes(normalizedEmail)) {
      userRole = 'admin';
    } else if (role === 'admin') {
      userRole = 'donor';
    }

    // Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role: userRole,
      locality: locality.trim(),
      passwordHash
    });

    sendTokenResponse(user, 201, res, 'Registration successful. Welcome to MedShare!');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user with passwordHash
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      // Generic message to prevent enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  try {
    res.cookie('medshare_token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'You have been successfully logged out.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password - generate token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success anyway to avoid email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been generated.'
      });
    }

    // Generate unhashed reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetToken field
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // Expire in 1 hour
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // In dev / demo, log the URL
    const clientBase = process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 5000}`;
    const resetUrl = `${clientBase}/pages/reset-password.html?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset link generated. Please check your email or developer terminal console.',
      devResetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    // Hash the incoming token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful. You are now logged in with your new password.');
  } catch (err) {
    next(err);
  }
};

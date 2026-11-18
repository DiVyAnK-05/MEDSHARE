const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, subject, message) are required'
      });
    }

    const contact = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'Unread'
    });

    // Notify all admin accounts so team creators immediately receive notice
    try {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await createNotification(
          admin._id,
          '📩 New Contact Inquiry Received',
          `New message from ${name.trim()} (${email.trim()}): "${subject.trim()}". Check Admin Inquiries.`,
          'system',
          '/pages/admin.html#inquiries'
        );
      }
    } catch (notifErr) {
      console.error('Failed to notify admins of contact message:', notifErr.message);
    }

    console.log(`\n📩 [MEDSHARE INQUIRY RECEIVED]`);
    console.log(`   From: ${name.trim()} <${email.trim()}>`);
    console.log(`   Subject: ${subject.trim()}`);
    console.log(`   Message: ${message.trim()}\n`);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received and saved to our database. Our creator team will review and respond shortly.',
      data: { id: contact._id }
    });
  } catch (err) {
    next(err);
  }
};

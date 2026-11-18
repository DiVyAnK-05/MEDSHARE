const Notification = require('../models/Notification');

/**
 * Creates an in-app notification for a user
 * @param {string|ObjectId} userId
 * @param {string} title
 * @param {string} message
 * @param {string} type - 'verification' | 'request_update' | 'expiry_alert' | 'system'
 * @param {string} link - optional internal link e.g. '/pages/dashboard.html'
 */
const createNotification = async (userId, title, message, type = 'system', link = '') => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link
    });
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
};

module.exports = {
  createNotification
};

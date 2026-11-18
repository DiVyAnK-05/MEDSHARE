const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetDonation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Reason for report is required'],
      enum: [
        'Suspected Opened / Used Packaging',
        'Incorrect or Manipulated Expiry Date',
        'Controlled / Prohibited Substance',
        'Suspicious Lister / Fraud Attempt',
        'Damaged or Contaminated Item',
        'Other Safety Violation'
      ]
    },
    details: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Investigated', 'Dismissed'],
      default: 'Pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);

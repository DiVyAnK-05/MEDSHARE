const mongoose = require('mongoose');
const { REQUEST_STATUS } = require('../config/constants');

const requestSchema = new mongoose.Schema(
  {
    requestCode: {
      type: String,
      unique: true,
      index: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    reason: {
      type: String,
      required: [true, 'Reason or patient prescription context is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    contactMethod: {
      type: String,
      enum: ['phone', 'email', 'in_app'],
      default: 'in_app'
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

requestSchema.index({ receiver: 1, donation: 1 });
requestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);

const mongoose = require('mongoose');
const { CATEGORIES, UNITS, HANDOVER_METHODS, DONATION_STATUS } = require('../config/constants');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    donationCode: {
      type: String,
      unique: true,
      index: true
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine brand name is required'],
      trim: true,
      index: true
    },
    genericName: {
      type: String,
      required: [true, 'Generic chemical composition / salts are required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES
    },
    quantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      enum: UNITS
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number from packaging is required for safety verification'],
      trim: true
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true
    },
    sealedPackaging: {
      type: Boolean,
      required: [true, 'Confirmation of original sealed packaging is mandatory'],
      default: true
    },
    photoPath: {
      type: String,
      required: [true, 'Photo of sealed medicine with visible expiry and batch number is required']
    },
    locality: {
      type: String,
      required: [true, 'Pickup locality is required'],
      trim: true,
      index: true
    },
    pickupAddress: {
      type: String,
      required: [true, 'Specific pickup or drop-off address is required'],
      trim: true
    },
    handoverMethod: {
      type: String,
      enum: HANDOVER_METHODS,
      default: 'dropoff_at_ngo'
    },
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.PENDING,
      index: true
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for searching and filtering
donationSchema.index({ status: 1, expiryDate: 1 });
donationSchema.index({ status: 1, category: 1 });
donationSchema.index({ status: 1, locality: 1 });

module.exports = mongoose.model('Donation', donationSchema);

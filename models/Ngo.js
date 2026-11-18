const mongoose = require('mongoose');

const collectionPointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true }
  },
  { _id: true }
);

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'NGO Name is required'],
      trim: true,
      index: true
    },
    area: {
      type: String,
      required: [true, 'Operating area is required'],
      trim: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Official NGO / Society registration number is required'],
      unique: true,
      trim: true
    },
    collectionPoints: [collectionPointSchema],
    workingHours: {
      type: String,
      default: '10:00 AM - 5:00 PM (Monday to Saturday)'
    },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      website: { type: String, default: '' }
    },
    isVerified: {
      type: Boolean,
      default: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ngo', ngoSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Please provide a valid contact phone number'],
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Never return by default
    },
    role: {
      type: String,
      enum: ['donor', 'receiver', 'ngo', 'admin'],
      default: 'donor'
    },
    locality: {
      type: String,
      required: [true, 'Please select or provide your locality in the Ghaziabad/NCR region'],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    resetToken: {
      type: String,
      default: null,
      select: false
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
      select: false
    },
    settings: {
      textSize: {
        type: String,
        enum: ['normal', 'large', 'x-large'],
        default: 'normal'
      },
      highContrast: {
        type: Boolean,
        default: false
      },
      reducedMotion: {
        type: Boolean,
        default: false
      },
      emailNotifications: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Role index
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

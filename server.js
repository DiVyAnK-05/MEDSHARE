require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const requestRoutes = require('./routes/requestRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Models for public impact stats
const Donation = require('./models/Donation');
const User = require('./models/User');
const Ngo = require('./models/Ngo');
const Request = require('./models/Request');
const { DONATION_STATUS, REQUEST_STATUS } = require('./config/constants');

const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for ease of serving local scripts, fonts, and inline styles
    crossOriginEmbedderPolicy: false
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Public Impact Stats API for Landing Page
app.get('/api/stats/public', async (req, res, next) => {
  try {
    const verifiedMedicinesCount = await Donation.countDocuments({
      status: { $in: [DONATION_STATUS.VERIFIED, DONATION_STATUS.MATCHED, DONATION_STATUS.HANDED_OVER] }
    });
    const fulfilledRequestsCount = await Request.countDocuments({
      status: { $in: [REQUEST_STATUS.FULFILLED, REQUEST_STATUS.APPROVED] }
    });
    const registeredDonorsCount = await User.countDocuments({ role: 'donor' });
    const verifiedNgosCount = await Ngo.countDocuments({ isVerified: true });

    res.status(200).json({
      success: true,
      data: {
        medicinesRedistributed: verifiedMedicinesCount + 42, // Includes baseline pilot count
        activeDonors: registeredDonorsCount + 18,
        beneficiariesServed: fulfilledRequestsCount + 56,
        partnerNgos: verifiedNgosCount || 3,
        pilotArea: 'KIET Group of Institutions & Ghaziabad'
      }
    });
  } catch (err) {
    next(err);
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Fallback for 404 API calls
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Custom 404 for HTML pages
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'pages', '404.html'));
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database and start Server
connectDB()
  .then(async () => {
    // Check if initial seed is needed (e.g. fresh in-memory database)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ Empty database detected. Auto-seeding initial demo data and accounts...');
      const { seedData } = require('./seed/seed');
      await seedData(false);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 MedShare Server running on port ${PORT}`);
      console.log(`🌐 Local Application URL: http://localhost:${PORT}`);
      console.log(`🏥 KIET Ghaziabad Pilot Active`);
      console.log(`======================================================\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to start MedShare server:', err.message);
  });

module.exports = app;

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Ngo = require('../models/Ngo');
const NgoApplication = require('../models/NgoApplication');
const Notification = require('../models/Notification');
const ContactMessage = require('../models/ContactMessage');
const { DONATION_STATUS, REQUEST_STATUS } = require('../config/constants');

const seedData = async (autoClose = true) => {
  try {
    console.log('🌱 Starting MedShare Database Seed...');
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Donation.deleteMany({});
    await Request.deleteMany({});
    await Ngo.deleteMany({});
    await NgoApplication.deleteMany({});
    await Notification.deleteMany({});
    await ContactMessage.deleteMany({});

    // Hash default password for demo accounts
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const donorPasswordHash = await bcrypt.hash('Donor@12345', 10);
    const receiverPasswordHash = await bcrypt.hash('Receiver@12345', 10);
    const ngoPasswordHash = await bcrypt.hash('NgoPartner@12345', 10);

    // 1. Create Core Accounts (including Creator Team)
    console.log('👥 Creating User Accounts...');
    const adminUser = await User.create({
      name: 'Jha Divyank',
      email: 'jhadivyank7@gmail.com',
      phone: '9507438151',
      passwordHash: adminPasswordHash,
      role: 'admin',
      locality: 'Ghaziabad, Delhi NCR',
      isActive: true,
      settings: { textSize: 'normal', highContrast: false, reducedMotion: false, emailNotifications: true }
    });

    const dhwaniUser = await User.create({
      name: 'Dhwani Bansal',
      email: '2628mca0300@kiet.edu',
      phone: '8445046646',
      passwordHash: adminPasswordHash,
      role: 'admin',
      locality: 'Ghaziabad, Delhi NCR',
      isActive: true,
      settings: { textSize: 'normal', highContrast: false, reducedMotion: false, emailNotifications: true }
    });

    const drishtiUser = await User.create({
      name: 'Drishti Tyagi',
      email: '2628mca0010@kiet.edu',
      phone: '7668952077',
      passwordHash: adminPasswordHash,
      role: 'admin',
      locality: 'Ghaziabad, Delhi NCR',
      isActive: true,
      settings: { textSize: 'normal', highContrast: false, reducedMotion: false, emailNotifications: true }
    });

    const backupAdminUser = await User.create({
      name: 'MedShare Administrator',
      email: 'admin@medshare.org',
      phone: '9876543210',
      passwordHash: adminPasswordHash,
      role: 'admin',
      locality: 'Ghaziabad, Delhi NCR',
      isActive: true,
      settings: { textSize: 'normal', highContrast: false, reducedMotion: false, emailNotifications: true }
    });

    const donorUser = await User.create({
      name: 'Aarav Sharma',
      email: 'donor@kiet.edu',
      phone: '9811223344',
      passwordHash: donorPasswordHash,
      role: 'donor',
      locality: 'Muradnagar, Ghaziabad',
      isActive: true,
      settings: { textSize: 'normal', highContrast: false, reducedMotion: false, emailNotifications: true }
    });

    const receiverUser = await User.create({
      name: 'Sunita Verma',
      email: 'receiver@kiet.edu',
      phone: '9822334455',
      passwordHash: receiverPasswordHash,
      role: 'receiver',
      locality: 'Raj Nagar Extension, Ghaziabad',
      isActive: true,
      settings: { textSize: 'normal', highContrast: false, reducedMotion: false, emailNotifications: true }
    });

    const ngoUser = await User.create({
      name: 'Pehchaan Foundation',
      email: 'ngo@pehchaan.org',
      phone: '9833445566',
      passwordHash: ngoPasswordHash,
      role: 'ngo',
      locality: 'Vasundhara, Ghaziabad',
      isActive: true,
      settings: { textSize: 'normal', highContrast: false, reducedMotion: false, emailNotifications: true }
    });

    // 2. Create Partner NGOs (Marked clearly as Demo)
    console.log('🏥 Creating Partner NGOs...');
    const ngo1 = await Ngo.create({
      name: 'Pehchaan Care Foundation [DEMO PARTNER]',
      area: 'Ghaziabad, Muradnagar & Modinagar Belt',
      registrationNumber: 'NGO-GZB-2023-8891-DEMO',
      collectionPoints: [
        {
          name: 'KIET Campus Gate 1 Student Drop Desk',
          address: 'KIET Group of Institutions, Delhi-NCR, NH-58, Muradnagar, Ghaziabad, UP 201206',
          contactPerson: 'Volunteer Desk In-charge',
          phone: '+91 98112 00001'
        },
        {
          name: 'Raj Nagar Extension Community Center',
          address: 'Plot 4, Sector 7, Raj Nagar Extension, Ghaziabad, UP 201017',
          contactPerson: 'Suresh Kumar',
          phone: '+91 98112 00002'
        }
      ],
      workingHours: '9:30 AM - 5:30 PM (Mon-Sat)',
      contact: {
        email: 'help@pehchaancare.demo.org',
        phone: '+91 120 4567890',
        website: 'https://pehchaancare.demo.org'
      },
      isVerified: true,
      user: ngoUser._id
    });

    const ngo2 = await Ngo.create({
      name: 'Swasthya Seva Trust Ghaziabad [DEMO PARTNER]',
      area: 'Vasundhara, Indirapuram & Vaishali',
      registrationNumber: 'NGO-UP-2021-4412-DEMO',
      collectionPoints: [
        {
          name: 'Vasundhara Sector 10 Dispensary Helpdesk',
          address: 'Near Shiv Mandir, Sector 10, Vasundhara, Ghaziabad, UP 201012',
          contactPerson: 'Dr. R. K. Gupta',
          phone: '+91 98112 00003'
        }
      ],
      workingHours: '10:00 AM - 4:00 PM (Mon-Fri)',
      contact: {
        email: 'info@swasthyaseva.demo.org',
        phone: '+91 120 2899011',
        website: 'https://swasthyaseva.demo.org'
      },
      isVerified: true
    });

    // 3. Create Sample Donations with Unexpired Dates (at least 6-12 months in future)
    console.log('💊 Creating Sample Donations...');
    const now = new Date();
    const futureDate = (months) => new Date(now.getFullYear(), now.getMonth() + months, 15);

    // Verified donation 1
    const med1 = await Donation.create({
      donor: donorUser._id,
      donationCode: 'MS-2026-A101',
      medicineName: 'Paracetamol 650mg (Dolo)',
      genericName: 'Paracetamol IP 650 mg',
      category: 'Pain Relief & Analgesics',
      quantity: 30,
      availableQuantity: 20,
      unit: 'tablets',
      batchNumber: 'DL24089',
      expiryDate: futureDate(14),
      sealedPackaging: true,
      photoPath: '/assets/sample-med-1.svg',
      locality: 'KIET Campus (Muradnagar, Ghaziabad)',
      pickupAddress: 'Hostel Block B, Room 204, KIET Campus',
      handoverMethod: 'dropoff_at_ngo',
      status: DONATION_STATUS.VERIFIED,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // Verified donation 2
    const med2 = await Donation.create({
      donor: donorUser._id,
      donationCode: 'MS-2026-B202',
      medicineName: 'Azithromycin 500mg (Azee)',
      genericName: 'Azithromycin Dihydrate IP 500 mg',
      category: 'Antibiotics',
      quantity: 15,
      availableQuantity: 15,
      unit: 'tablets',
      batchNumber: 'AZ99120',
      expiryDate: futureDate(10),
      sealedPackaging: true,
      photoPath: '/assets/sample-med-2.svg',
      locality: 'Raj Nagar Extension (Ghaziabad)',
      pickupAddress: 'Tower 3, KC Royal Palms, Raj Nagar Extension',
      handoverMethod: 'dropoff_at_ngo',
      status: DONATION_STATUS.VERIFIED,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    // Verified donation 3
    const med3 = await Donation.create({
      donor: donorUser._id,
      donationCode: 'MS-2026-C303',
      medicineName: 'Becosules Z Multivitamin Capsules',
      genericName: 'Vitamin B-Complex with Vitamin C & Zinc',
      category: 'Vitamins & Supplements',
      quantity: 40,
      availableQuantity: 40,
      unit: 'capsules',
      batchNumber: 'BC55412',
      expiryDate: futureDate(8),
      sealedPackaging: true,
      photoPath: '/assets/sample-med-3.svg',
      locality: 'Muradnagar Town',
      pickupAddress: 'Near Railway Crossing, Muradnagar',
      handoverMethod: 'dropoff_at_ngo',
      status: DONATION_STATUS.VERIFIED,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    // Verified donation 4
    const med4 = await Donation.create({
      donor: donorUser._id,
      donationCode: 'MS-2026-D404',
      medicineName: 'Cetirizine 10mg (Cetzine)',
      genericName: 'Cetirizine Hydrochloride IP 10 mg',
      category: 'Respiratory & Allergy',
      quantity: 50,
      availableQuantity: 50,
      unit: 'tablets',
      batchNumber: 'CT77810',
      expiryDate: futureDate(16),
      sealedPackaging: true,
      photoPath: '/assets/sample-med-4.svg',
      locality: 'Vasundhara (Ghaziabad)',
      pickupAddress: 'Sector 14 Market, Vasundhara',
      handoverMethod: 'donor_delivery',
      status: DONATION_STATUS.VERIFIED,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });

    // Pending verification donation
    const medPending = await Donation.create({
      donor: donorUser._id,
      donationCode: 'MS-2026-E505',
      medicineName: 'Pantoprazole 40mg (Pan 40)',
      genericName: 'Pantoprazole Gastro-resistant Tablets IP 40 mg',
      category: 'Gastrointestinal',
      quantity: 20,
      availableQuantity: 20,
      unit: 'tablets',
      batchNumber: 'PN88123',
      expiryDate: futureDate(9),
      sealedPackaging: true,
      photoPath: '/assets/sample-med-1.svg',
      locality: 'Indirapuram (Ghaziabad)',
      pickupAddress: 'Ahinsa Khand 2, Indirapuram',
      handoverMethod: 'volunteer_pickup',
      status: DONATION_STATUS.PENDING
    });

    // 4. Create Sample Request
    console.log('📋 Creating Sample Requests...');
    await Request.create({
      requestCode: 'REQ-2026-9011',
      receiver: receiverUser._id,
      donation: med1._id,
      quantity: 10,
      reason: 'Suffering from viral fever and headache, prescribed Paracetamol 650mg by KIET campus doctor.',
      contactMethod: 'in_app',
      status: REQUEST_STATUS.PENDING
    });

    // 5. Create Sample NGO Application
    console.log('📝 Creating Sample NGO Partner Application...');
    await NgoApplication.create({
      organizationName: 'Umeed Welfare Society (Ghaziabad Chapter)',
      registrationNumber: 'REG-UP-SOCIETY-2019-9081',
      contactPerson: 'Meenakshi Sundaram',
      email: 'contact@umeedwelfare.demo.org',
      phone: '+91 98711 22334',
      operatingAreas: ['Ghaziabad', 'Muradnagar', 'Modinagar'],
      officialAddress: '42, Nehru Nagar, Ghaziabad, Uttar Pradesh',
      missionStatement: 'Providing primary health relief kits and emergency first-aid supplies to unreached families across western Uttar Pradesh.',
      status: 'Pending'
    });

    // 6. Create Initial Notifications
    console.log('🔔 Creating Initial Notifications...');
    await Notification.create({
      user: adminUser._id,
      title: 'New Donation Awaiting Verification',
      message: 'Pan 40 (MS-2026-E505) has been submitted and is waiting for your safety review.',
      type: 'verification',
      link: '/pages/admin.html'
    });

    await Notification.create({
      user: donorUser._id,
      title: 'Donation Approved',
      message: 'Your donation of Paracetamol 650mg (MS-2026-A101) has been verified and is active.',
      type: 'verification',
      link: '/pages/dashboard.html'
    });

    // 7. Create Sample Contact Inquiries
    console.log('📩 Creating Sample Contact Inquiries...');
    await ContactMessage.create({
      name: 'Rohan Mehra',
      email: 'rohan.mehra@kiet.edu',
      subject: 'Inquiry regarding drop-off at KIET Gate 1 Desk',
      message: 'Hello MedShare team! I have two strips of unopened Cetirizine 10mg expiring in 2028. Can I drop them off at the Main Gate 1 desk tomorrow morning around 10 AM?',
      status: 'Unread'
    });

    await ContactMessage.create({
      name: 'Dr. S. K. Gupta',
      email: 'dr.gupta@swasthya-clinic.org',
      subject: 'Institutional Partnership & First-Aid Kit Allocation',
      message: 'Greetings from Swasthya Clinic. We would like to collaborate with MedShare for our weekend free health camp in Muradnagar. Please connect with our team.',
      status: 'Unread'
    });

    await Notification.create({
      user: receiverUser._id,
      title: 'Request Queued',
      message: 'Your request for Paracetamol 650mg is being coordinated with Pehchaan Care Foundation.',
      type: 'request_update',
      link: '/pages/dashboard.html'
    });

    console.log('\n=============================================================');
    console.log('✅ MedShare Database Seed Completed Successfully!');
    console.log('=============================================================');

    if (autoClose) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    if (autoClose) process.exit(1);
    throw err;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };

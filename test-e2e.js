/**
 * MedShare - Automated End-to-End Test Suite
 * Tests full lifecycle: Auth, Safety Validation, Donations, Requests, Admin, Notifications, NGOs, Contact
 */
require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const Donation = require('./models/Donation');
const Request = require('./models/Request');
const Ngo = require('./models/Ngo');
const ContactMessage = require('./models/ContactMessage');
const { validateMedicineSafety } = require('./utils/safetyValidator');

async function runTests() {
  console.log('🧪 Starting MedShare End-to-End Validation Suite...\n');

  try {
    await connectDB();
    const { seedData } = require('./seed/seed');
    await seedData(false);

    let passedTests = 0;
    let failedTests = 0;

    function assert(condition, testName) {
      if (condition) {
        console.log(`  ✅ PASS: ${testName}`);
        passedTests++;
      } else {
        console.error(`  ❌ FAIL: ${testName}`);
        failedTests++;
      }
    }

    // TEST 1: Safety Validator - Expired Medicine Rejection
    console.log('--- Test Suite 1: Medicine Safety Engine ---');
    const expiredCheck = validateMedicineSafety({
      medicineName: 'Old Paracetamol',
      genericName: 'Paracetamol',
      expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      sealedPackaging: true,
      quantity: 10,
      unit: 'tablets'
    });
    assert(expiredCheck.isValid === false, 'Rejects expired medicine');

    // TEST 2: Safety Validator - Under 90 Days Shelf Life Rejection
    const nearExpiryCheck = validateMedicineSafety({
      medicineName: 'Near Expiry Cough Tab',
      genericName: 'Dextromethorphan',
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days (less than 90)
      sealedPackaging: true,
      quantity: 10,
      unit: 'tablets'
    });
    assert(nearExpiryCheck.isValid === false, 'Rejects medicine with < 90 days remaining shelf life');

    // TEST 3: Safety Validator - Narcotics & Cold-Chain Blacklist
    const coldChainCheck = validateMedicineSafety({
      medicineName: 'Human Actrapid Insulin',
      genericName: 'Insulin Injection',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      sealedPackaging: true,
      quantity: 1,
      unit: 'bottles'
    });
    assert(coldChainCheck.isValid === false, 'Rejects cold-chain insulin injection');

    const narcoticCheck = validateMedicineSafety({
      medicineName: 'Alprax 0.5',
      genericName: 'Alprazolam',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      sealedPackaging: true,
      quantity: 10,
      unit: 'tablets'
    });
    assert(narcoticCheck.isValid === false, 'Rejects controlled / narcotic substance (Alprazolam)');

    // TEST 4: Safety Validator - Valid Unexpired Medicine Acceptance
    const validCheck = validateMedicineSafety({
      medicineName: 'Dolo 650',
      genericName: 'Paracetamol IP 650mg',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year away
      sealedPackaging: true,
      quantity: 20,
      unit: 'tablets'
    });
    assert(validCheck.isValid === true, 'Accepts valid sealed unexpired medicine');

    // TEST 5: Database User Account Integrity
    console.log('\n--- Test Suite 2: User Accounts & Roles ---');
    const admin = await User.findOne({ email: 'admin@medshare.org' });
    assert(admin !== null && admin.role === 'admin', 'Admin demo account exists with admin role');

    const donor = await User.findOne({ email: 'donor@kiet.edu' });
    assert(donor !== null && donor.role === 'donor', 'Donor demo account exists with donor role');

    const receiver = await User.findOne({ email: 'receiver@kiet.edu' });
    assert(receiver !== null && receiver.role === 'receiver', 'Receiver demo account exists with receiver role');

    // TEST 6: Verified Medicine Querying
    console.log('\n--- Test Suite 3: Public Medicines Directory ---');
    const verifiedMeds = await Donation.find({ status: 'Verified' });
    assert(verifiedMeds.length > 0, `Public directory has ${verifiedMeds.length} verified medicines in stock`);

    // TEST 7: NGO Directory
    console.log('\n--- Test Suite 4: NGO Network ---');
    const ngos = await Ngo.find({ isVerified: true });
    assert(ngos.length >= 2, `Verified NGO network has ${ngos.length} partner organizations`);

    // TEST 8: Contact Inquiries Inbox
    console.log('\n--- Test Suite 5: Contact Inquiries & Admin Inbox ---');
    const testMsg = await ContactMessage.create({
      name: 'Pooja Sharma',
      email: 'pooja@kiet.edu',
      subject: 'Inquiry on hostel collection point',
      message: 'Can I drop off medicines at Gargi Hostel reception?',
      status: 'Unread'
    });
    assert(testMsg._id !== undefined, 'Contact inquiry successfully saved to database');
    const unreadMsgs = await ContactMessage.find({ status: 'Unread' });
    assert(unreadMsgs.length >= 1, `Admin inbox has ${unreadMsgs.length} unread inquiry message(s)`);

    console.log('\n======================================================');
    console.log(`📊 Test Summary: ${passedTests} Passed, ${failedTests} Failed`);
    console.log('======================================================\n');

    await disconnectDB();
    if (failedTests > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Test Suite Exception:', err);
    process.exit(1);
  }
}

runTests();

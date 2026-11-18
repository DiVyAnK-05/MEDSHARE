/**
 * MedShare Application Constants & Configuration
 */

module.exports = {
  // Brand Palette Constants (for reference)
  PALETTE: {
    MIDNIGHT_NAVY: '#0B1F2A',
    MEDICAL_TEAL: '#0E7C86',
    FRESH_MINT: '#4ADE9C',
    CLOUD_WHITE: '#F3F8F9',
    DEEP_SLATE: '#1F3A44',
    AMBER: '#FFB224'
  },

  // User Roles
  ROLES: {
    DONOR: 'donor',
    RECEIVER: 'receiver',
    NGO: 'ngo',
    ADMIN: 'admin'
  },

  // Donation Statuses
  DONATION_STATUS: {
    PENDING: 'Pending Verification',
    VERIFIED: 'Verified',
    MATCHED: 'Matched',
    HANDED_OVER: 'Handed Over',
    REJECTED: 'Rejected'
  },

  // Request Statuses
  REQUEST_STATUS: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    FULFILLED: 'Fulfilled',
    CANCELLED: 'Cancelled'
  },

  // Categories of Medicines allowed on MedShare
  CATEGORIES: [
    'Pain Relief & Analgesics',
    'Antibiotics',
    'Vitamins & Supplements',
    'First Aid & Antiseptics',
    'Respiratory & Allergy',
    'Gastrointestinal',
    'Cardiovascular & Hypertension',
    'Dermatological / Skin Care',
    'Diabetes Care (Non-Refrigerated Oral)',
    'Other Essential OTC'
  ],

  // Units
  UNITS: [
    'tablets',
    'capsules',
    'strips',
    'bottles',
    'tubes',
    'boxes'
  ],

  // Handover methods
  HANDOVER_METHODS: [
    'dropoff_at_ngo',
    'donor_delivery',
    'volunteer_pickup'
  ],

  // Prohibited Medicine Categories & Terms (Safety Rules)
  // Schedule X, narcotics, sleeping pills, cold-chain requiring items (insulin, vaccines), injections, opened liquids
  PROHIBITED_TERMS: [
    'insulin',
    'vaccine',
    'morphine',
    'codeine',
    'fentanyl',
    'tramadol',
    'buprenorphine',
    'methadone',
    'oxycodone',
    'alprazolam',
    'diazepam',
    'lorazepam',
    'clonazepam',
    'zolpidem',
    'ketamine',
    'phenobarbital',
    'pethidine',
    'pentazocine',
    'injection',
    'infusion',
    'chemotherapy',
    'cytotoxic',
    'blood product'
  ],

  // Localities focused around KIET Group of Institutions & Ghaziabad region
  LOCALITIES: [
    'KIET Campus (Muradnagar, Ghaziabad)',
    'Muradnagar Town',
    'Raj Nagar Extension (Ghaziabad)',
    'Raj Nagar (Ghaziabad)',
    'Kavi Nagar (Ghaziabad)',
    'Vasundhara (Ghaziabad)',
    'Indirapuram (Ghaziabad)',
    'Vaishali (Ghaziabad)',
    'Siddharth Vihar (Ghaziabad)',
    'Crossings Republik (Ghaziabad)',
    'Mohan Nagar (Ghaziabad)',
    'Govindpuram (Ghaziabad)',
    'Noida Sector 62 / NCR Border',
    'Meerut Road Industrial Area'
  ],

  // Minimum shelf life in days before expiry
  MIN_SHELF_LIFE_DAYS: 90
};

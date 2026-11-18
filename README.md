# MedShare 💊
### A Full-Stack Platform for Donating and Redistributing Unused, Unexpired Medicines
**Pilot Region: KIET Group of Institutions / Muradnagar / Ghaziabad (Delhi NCR & Uttar Pradesh)**

---

## 1. Project Overview

**MedShare** is a full-stack healthcare web application engineered to solve domestic pharmaceutical wastage. In urban households and student hostels, up to 23% of purchased medicines expire in cabinets and end up in municipal landfills. Simultaneously, thousands of low-income patients and students delay essential therapies due to medicine expenses.

MedShare establishes a trusted, closed-loop redistribution mesh:
1. **Donors (Households & Students):** List sealed, unexpired medicines (&ge; 90 days shelf-life) with packaging photos.
2. **Receivers (Patients & Families in Need):** Browse verified community inventory and request needed medicines free of cost.
3. **NGO Partners & Health Desks:** Verified non-profit organizations (e.g. *Pehchaan Care Foundation*) operate physical collection and distribution desks.
4. **Admins & Compliance Volunteers:** Audit listings, verify packaging seals and batch numbers, and oversee hand-overs.

---

## 2. Technology Stack

- **Frontend:** Semantic HTML5, CSS3 (CSS Variables, Flexbox, Grid, no CSS framework), Vanilla JavaScript (ES6+ Modules).
- **Backend:** Node.js + Express.js modular REST API.
- **Database:** MongoDB with Mongoose ODM (supports MongoDB Atlas, local MongoDB, and embedded In-Memory MongoDB for zero-config testing).
- **Authentication & Security:** JWT tokens stored in `httpOnly` SameSite cookies, bcrypt (10 salt rounds), `helmet` security headers, `cors`, `express-rate-limit`, `express-validator`.
- **File Uploads:** Multer with filetype restriction (JPG, PNG, WebP) and 2 MB limits.
- **Single-Command Hosting:** The Express backend concurrently serves the REST API and the frontend static assets.

---

## 3. Brand Color Palette

| Token Name | Hex Code | Primary Usage |
| :--- | :--- | :--- |
| **Midnight Navy** | `#0B1F2A` | Primary text, navigation bar, headers, footer background |
| **Medical Teal** | `#0E7C86` | Primary brand color, main call-to-actions, active navigation |
| **Fresh Mint** | `#4ADE9C` | "Verified" status badges, success confirmations, impact stats |
| **Cloud White** | `#F3F8F9` | Page body background, card alternate surfaces |
| **Deep Slate** | `#1F3A44` | Secondary text, dashboard cards, table headers |
| **Amber** | `#FFB224` | Shelf-life alerts (&le; 120 days), safety warnings, admin badges |

---

## 4. Demo Login Accounts

The database seed script automatically creates ready-to-test demo accounts:

| Role | Email Address | Demo Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin / Auditor** | `admin@medshare.org` | `Admin@12345` | Audit verification queue, approve/reject donations, manage requests, toggle user access, review NGO partner applications |
| **Student Donor** | `donor@kiet.edu` | `Donor@12345` | Donate medicines, upload photos, track verification status, view community impact |
| **Patient Receiver** | `receiver@kiet.edu` | `Receiver@12345` | Request medicines, specify reasons, track fulfillment |
| **NGO Representative** | `ngo@pehchaan.org` | `NgoPartner@12345` | Manage collection point drop-desks and community allocations |

> *Note: For convenience, the Login page (`/pages/login.html`) features one-click "Evaluator Quick-Fill" buttons for each role.*

---

## 5. Quick Installation & Running

### Step 1: Clone or Navigate to Directory
```bash
cd MEDSHARE
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Default settings automatically use MongoMemoryServer in development if no `MONGODB_URI` is specified, allowing instant zero-friction running).*

### Step 4: Seed Database with Demo Records
```bash
npm run seed
```

### Step 5: Start the Server
```bash
npm start
```
Access the application in your browser at:
**`http://localhost:5000`**

---

## 6. Project Folder Structure

```text
medshare/
├── server.js                          # Express server entry point & static file server
├── package.json                       # Scripts and project dependencies
├── .env.example                       # Documented environment variables
├── .env                               # Runtime configuration
├── README.md                          # Full architectural documentation
├── config/
│   ├── db.js                          # Mongoose connection with Atlas & Memory fallback
│   └── constants.js                   # 6 brand colors, roles, categories, prohibited terms
├── models/
│   ├── User.js                        # User accounts, RBAC roles, settings
│   ├── Donation.js                    # Medicine records, batch numbers, photo paths, status
│   ├── Request.js                     # Patient medicine requests, reasons, status
│   ├── Ngo.js                         # Verified NGOs, collection points, hours
│   ├── NgoApplication.js              # NGO partnership applications
│   ├── Notification.js                # In-app notification alerts
│   ├── Report.js                      # Safety violation reports
│   └── ContactMessage.js              # Contact messages
├── middleware/
│   ├── auth.js                        # JWT cookie & header authentication
│   ├── roles.js                       # Role-based access control (RBAC)
│   ├── validate.js                    # express-validator result handler
│   ├── upload.js                      # Multer configuration (JPG/PNG/WebP, max 2MB)
│   ├── errorHandler.js                # Centralized error formatter
│   └── rateLimit.js                   # express-rate-limit definitions
├── controllers/
│   ├── authController.js              # Register, login, logout, me, forgot/reset password
│   ├── userController.js              # Profile updates, password changes, accessibility settings
│   ├── donationController.js          # Donate medicine, my donations, public browse, detail
│   ├── requestController.js           # Medicine requests, my requests, cancellation
│   ├── ngoController.js               # NGO directory, partner applications
│   ├── notificationController.js      # Fetch and mark notifications read
│   ├── reportController.js            # Safety report handling
│   ├── contactController.js           # Contact form submissions
│   └── adminController.js             # Verification queue, stats, users, requests, applications
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── donationRoutes.js
│   ├── medicineRoutes.js              # Public verified medicines API
│   ├── requestRoutes.js
│   ├── ngoRoutes.js
│   ├── notificationRoutes.js
│   ├── reportRoutes.js
│   ├── contactRoutes.js
│   └── adminRoutes.js
├── services/
│   ├── notificationService.js         # Transactional notification dispatcher
│   └── emailService.js                # Password reset simulation logger
├── utils/
│   ├── safetyValidator.js             # 90-day shelf life, sealed blister, narcotics filter
│   └── helpers.js                     # Code generators (MS-XXXX, REQ-XXXX) & phone masking
├── seed/
│   └── seed.js                        # Database population script
├── uploads/                           # Multer storage destination for medicine photos
└── public/
    ├── index.html                     # Landing page with live impact counters & pilot info
    ├── css/
    │   ├── variables.css              # 6 brand colors, typography, high-contrast tokens
    │   ├── base.css                   # Semantic typography, skip link, accessible reset
    │   ├── components.css             # Navbar, footer, buttons, cards, badges, modal, toast
    │   └── pages.css                  # Browse grid, admin tables, dashboard layouts
    ├── js/
    │   ├── api.js                     # Centralized API fetch wrapper
    │   ├── auth.js                    # Session handling, navbar state, route guards
    │   ├── ui.js                      # Toast notifications, modal helpers, accessibility state
    │   └── validation.js              # Form validation & 90-day expiry calculations
    └── pages/
        ├── login.html                 # Login page with demo quick-fills & show/hide password
        ├── signup.html                # Signup page with role selection
        ├── forgot-password.html       # Password reset token generation
        ├── reset-password.html        # Secure password reset
        ├── dashboard.html             # Role-based user dashboard (Donations, Requests, Alerts)
        ├── donate.html                # Multi-step safety validated donation form
        ├── browse.html                # Search, filter by category/area, sort, and paginate
        ├── medicine-detail.html       # Detailed medicine view & patient request flow
        ├── ngo-partners.html          # Verified NGO list & partnership application
        ├── verification.html          # Multi-step verification standard explanation
        ├── safety.html                # Regulatory, medical, and packaging safety rules
        ├── profile.html               # Profile editing & password change
        ├── settings.html              # Text scaling, high contrast, reduced motion
        ├── admin.html                 # Verification queue, requests, users, NGO apps
        ├── about.html                 # Mission, team of 3, KIET pilot scope
        ├── contact.html               # Contact form saving to database
        ├── faq.html                   # Frequently asked questions
        ├── privacy.html               # Privacy policy & data protection
        └── 404.html                   # Custom 404 error page
```

---

## 7. REST API Endpoints

### Authentication & Users
- `POST /api/auth/register` - Create account (name, email, phone, role, locality, password)
- `POST /api/auth/login` - Authenticate with email/password, issues httpOnly JWT cookie
- `POST /api/auth/logout` - Clear authentication cookie
- `GET /api/auth/me` - Get profile of current logged-in user
- `POST /api/auth/forgot-password` - Request password reset token
- `POST /api/auth/reset-password/:token` - Reset password using token
- `PUT /api/users/me` - Update name, phone, locality
- `PUT /api/users/me/password` - Change password (verifies current password)
- `PUT /api/users/me/settings` - Update text scaling, contrast, and notification settings

### Medicines & Donations
- `POST /api/donations` - Submit medicine with packaging photo & safety verification
- `GET /api/donations/mine` - View donations listed by current user
- `DELETE /api/donations/:id` - Cancel a pending donation
- `GET /api/medicines` - Public directory of verified, unexpired medicines (search, filter, sort, paginate)
- `GET /api/medicines/:id` - View single verified medicine details

### Requests
- `POST /api/requests` - Submit request for verified medicine (checks available quantity)
- `GET /api/requests/mine` - View requests placed by current user
- `PUT /api/requests/:id/cancel` - Cancel pending request (releases quantity back to inventory)

### NGOs & Community
- `GET /api/ngos` - Public list of verified NGOs & collection desks
- `POST /api/ngos/apply` - Submit NGO partner application
- `GET /api/notifications` - Get user notifications & unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `POST /api/reports` - Report suspicious listing or safety violation
- `POST /api/contact` - Submit contact inquiry to database
- `GET /api/stats/public` - Public aggregate impact metrics

### Admin Portal (`admin` role required)
- `GET /api/admin/stats` - Platform-wide metrics (donations, users, requests, pending audits)
- `GET /api/admin/donations` - All donations with optional status filter
- `PUT /api/admin/donations/:id/verify` - Approve pending donation into public inventory
- `PUT /api/admin/donations/:id/reject` - Reject donation with audit reason
- `GET /api/admin/requests` - All community requests
- `PUT /api/admin/requests/:id/status` - Update request status (`Approved`, `Fulfilled`, `Rejected`)
- `GET /api/admin/users` - Directory of registered users
- `PUT /api/admin/users/:id/status` - Activate or deactivate user account
- `GET /api/admin/ngo-applications` - List NGO partner applications
- `PUT /api/admin/ngo-applications/:id` - Review and approve/reject NGO application
- `GET /api/admin/reports` - Audit flagged safety reports
- `GET /api/admin/contact-messages` - View user & NGO support messages and questions
- `PUT /api/admin/contact-messages/:id/status` - Mark message status (`Read`, `Replied`, `Unread`)
- `DELETE /api/admin/contact-messages/:id` - Delete contact inquiry from database

---

## 8. Medicine Safety Rules & Compliance

1. **Expiry Threshold:** Every medicine must have at least **90 days (approx. 3 months)** remaining before manufacturer expiration date. Any medicine under 90 days or expired is rejected on the server.
2. **Original Sealed Packaging:** Only factory-sealed blister packs or untampered bottles are accepted. Cut strips, loose pills, and opened bottles are strictly barred.
3. **Prohibited Items Blacklist:** Automated server filter rejects narcotics, sleep aids, chemotherapy items, injectable ampoules, and cold-chain requiring items (insulin, vaccines).
4. **Regulatory Standing:** MedShare operates as a community welfare platform in accordance with Indian health guidelines, routing redistribution through verified non-profits and registered pharmacists.

---

## 9. Future Scalability Roadmap

1. **Smart GPS Proximity Matching:** Automatically match donors with the nearest active NGO drop desk or campus volunteer within a 5 km radius.
2. **OCR Medicine Strip Scanning:** Mobile camera batch scanning to automatically extract manufacturer batch numbers, active salts, and expiry dates from blister foils.
3. **Mobile Progressive Web App (PWA):** Offline capability, push notifications for expiring medicine reminders, and QR code hand-over verification.
4. **All-India Expansion:** Regional hub deployments across Delhi NCR, Uttar Pradesh, and nationwide community health clinics.

---

## 10. College Project Team & Contact Information

**Institution:** KIET Group of Institutions (Muradnagar, Ghaziabad, UP 201206)  
**Program:** Master of Computer Applications (MCA) &bull; Final-Year Capstone Project (Team of 3)

| Team Member | Project Role | Contact Phone | Email Address |
| :--- | :--- | :--- | :--- |
| **Divyank** | **Lead Creator & Full-Stack Engineer** (Node.js/Express, MongoDB Schemas, JWT Auth, Safety Engine) | `jhadivyank7@gmail.com` |
| **Dhwani Bansal** | **Co-Creator & Frontend/UI Lead** (HTML5 Semantic Templates, CSS Design Tokens, Ladder Taskbar, Accessibility) | `2628mca0300@kiet.edu` |
| **Drishti Tyagi** | **Co-Creator & Safety/Compliance Lead** (Drug Scheduling & Blacklist, 90-Day Shelf-Life Rules, NGO Workflows) | `2628mca0010@kiet.edu` |

---

*MedShare &bull; Built with care for community health at KIET Group of Institutions.*

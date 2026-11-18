const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `med-${uniqueSuffix}${ext}`);
  }
});

// File filter (JPG, PNG, WebP only)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedExtensions.test(file.mimetype);
  const extensionCheck = allowedExtensions.test(ext.substring(1));

  if (mimetype && extensionCheck) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only JPG, PNG, and WebP image files are allowed.'));
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  },
  fileFilter: fileFilter
});

module.exports = upload;

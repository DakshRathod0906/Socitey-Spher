import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

// Supported upload categories — each gets its own subdirectory
const CATEGORIES = ["complaints", "notices", "residents", "societies", "services", "documents"];

// Ensure all category directories exist on startup
for (const cat of CATEGORIES) {
  const dir = path.join(UPLOADS_ROOT, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Creates a Multer storage engine for a specific upload category.
 * Files are saved to `uploads/<category>/` with unique timestamped names.
 * 
 * @param {string} category - One of the CATEGORIES (e.g. "complaints", "notices").
 * @returns {multer.StorageEngine}
 */
const createStorage = (category) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOADS_ROOT, category);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${category}-${uniqueSuffix}${ext}`);
    },
  });
};

// File filter to accept only images
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`), false);
  }
};

// File filter to accept images and documents
const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: images, PDF, and Word documents.`), false);
  }
};

// --- Pre-configured upload middlewares ---

/**
 * Upload a single image for complaints.
 * Field name: "image"
 * Max size: 5MB
 */
export const uploadComplaintImage = multer({
  storage: createStorage("complaints"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
}).single("image");

/**
 * Upload multiple images for complaints.
 * Field name: "images"
 * Max count: 5
 * Max size: 5MB each
 */
export const uploadComplaintImages = multer({
  storage: createStorage("complaints"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).array("images", 5);

/**
 * Upload a single image for service work order completion photos.
 * Field name: "photo"
 * Max size: 5MB
 */
export const uploadServicePhoto = multer({
  storage: createStorage("services"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("photo");

/**
 * Upload a single attachment for notices.
 * Field name: "attachment"
 * Max size: 10MB
 */
export const uploadNoticeAttachment = multer({
  storage: createStorage("notices"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
}).single("attachment");

/**
 * Upload resident documents (ID proof, lease, etc.).
 * Field name: "document"
 * Max size: 10MB
 */
export const uploadResidentDocument = multer({
  storage: createStorage("documents"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
}).single("document");

/**
 * Upload society logo.
 * Field name: "logo"
 * Max size: 2MB
 */
export const uploadSocietyLogo = multer({
  storage: createStorage("societies"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("logo");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

/**
 * Converts an absolute file system path to a relative URL path
 * suitable for storing in MongoDB and serving via Express static middleware.
 *
 * Example: "C:\...\uploads\complaints\img.jpg" → "/uploads/complaints/img.jpg"
 *
 * @param {string} absolutePath - The absolute path returned by multer.
 * @returns {string} The relative URL path.
 */
export const toRelativeUrl = (absolutePath) => {
  const relative = path.relative(path.join(UPLOADS_ROOT, ".."), absolutePath);
  // Normalize Windows backslashes to forward slashes for URL compatibility
  return "/" + relative.split(path.sep).join("/");
};

/**
 * Deletes a file from disk given its relative URL path.
 * Used when replacing or removing an uploaded file.
 *
 * @param {string} relativeUrl - The relative URL (e.g. "/uploads/complaints/img.jpg").
 * @returns {boolean} True if deleted, false if file didn't exist.
 */
export const deleteFile = (relativeUrl) => {
  try {
    const absolutePath = path.join(UPLOADS_ROOT, "..", relativeUrl);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[UPLOAD_SERVICE] Failed to delete file: ${relativeUrl}`, error.message);
    return false;
  }
};

/**
 * Processes a multer file object and returns metadata suitable for saving to MongoDB.
 *
 * @param {Object} file - A multer file object (req.file or element of req.files).
 * @returns {Object} File metadata with relativeUrl, originalName, mimeType, and sizeBytes.
 */
export const processUploadedFile = (file) => {
  if (!file) return null;
  return {
    url: toRelativeUrl(file.path),
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  };
};

/**
 * Processes an array of multer file objects.
 *
 * @param {Object[]} files - Array of multer file objects (req.files).
 * @returns {Object[]} Array of file metadata objects.
 */
export const processUploadedFiles = (files) => {
  if (!files || files.length === 0) return [];
  return files.map(processUploadedFile);
};

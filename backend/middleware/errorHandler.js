import multer from "multer";

export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  // Handle Multer-specific errors (file too large, wrong type, etc.)
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Please upload a smaller file."
        : `Upload error: ${err.message}`;
    return res.status(400).json({ message });
  }

  const statusCode = err.status || err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

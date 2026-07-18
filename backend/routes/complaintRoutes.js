import express from "express";
import {
  createComplaint,
  listComplaints,
  assignComplaint,
  submitFeedback,
  uploadAttachment,
} from "../controllers/complaintController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import { uploadServicePhoto } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("resident"), enforceTenant, createComplaint);
router.get("/", protect, enforceTenant, listComplaints);
router.put("/:id/assign", protect, authorize("society_admin"), enforceTenant, assignComplaint);
router.put("/:id/feedback", protect, authorize("resident"), enforceTenant, submitFeedback);
router.post("/:id/attachments", protect, enforceTenant, uploadServicePhoto, uploadAttachment);

export default router;

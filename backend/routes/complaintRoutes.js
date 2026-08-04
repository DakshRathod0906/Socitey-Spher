import express from "express";
import {
  createComplaint,
  listComplaints,
  getComplaint,
  cancelComplaint,
  rejectComplaint,
  requestReopen,
  approveReopen,
  rejectReopen,
  closeComplaint,
  resolveComplaint,
  updateStatus,
} from "../controllers/complaintController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import { uploadComplaintImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, enforceTenant);

router.post("/", authorize("resident"), uploadComplaintImages, createComplaint);
router.get("/", listComplaints);
router.get("/:id", getComplaint);

router.post("/:id/cancel", authorize("resident"), cancelComplaint);
router.post("/:id/reject", authorize("society_admin"), rejectComplaint);

router.post("/:id/request-reopen", authorize("resident"), requestReopen);
router.post("/:id/approve-reopen", authorize("society_admin"), approveReopen);
router.post("/:id/reject-reopen", authorize("society_admin"), rejectReopen);

router.post("/:id/close", authorize("resident", "society_admin"), closeComplaint);
router.post("/:id/resolve", authorize("society_admin", "service_staff"), resolveComplaint);
router.post("/:id/status", authorize("society_admin"), updateStatus);

export default router;

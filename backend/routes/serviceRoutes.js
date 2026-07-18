import express from "express";
import {
  listWorkOrders,
  acceptWorkOrder,
  updateProgress,
  uploadCompletionPhoto,
  completeWorkOrder,
} from "../controllers/serviceController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import { uploadServicePhoto } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect, enforceTenant, listWorkOrders);
router.put("/:id/accept", protect, authorize("service_staff"), enforceTenant, acceptWorkOrder);
router.put("/:id/progress", protect, authorize("service_staff"), enforceTenant, updateProgress);
router.put("/:id/photo", protect, authorize("service_staff"), enforceTenant, uploadServicePhoto, uploadCompletionPhoto);
router.put("/:id/complete", protect, authorize("service_staff"), enforceTenant, completeWorkOrder);

export default router;

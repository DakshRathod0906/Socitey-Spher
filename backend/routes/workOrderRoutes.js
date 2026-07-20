import express from "express";
import {
  assignWorkOrder,
  getActiveWorkOrders,
  startWorkOrder,
  resolveWorkOrder,
  cancelWorkOrder,
} from "../controllers/workOrderController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import { uploadServicePhoto } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, enforceTenant);

router.post("/", authorize("society_admin"), assignWorkOrder);
router.get("/active", authorize("service_staff"), getActiveWorkOrders);

router.patch("/:id/start", authorize("service_staff"), startWorkOrder);
router.patch("/:id/resolve", authorize("service_staff"), uploadServicePhoto, resolveWorkOrder);
router.patch("/:id/cancel", authorize("society_admin"), cancelWorkOrder);

export default router;

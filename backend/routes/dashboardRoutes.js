import express from "express";
import {
  adminDashboard,
  residentDashboard,
  superAdminDashboard,
  getNotifications,
  markNotificationRead,
} from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.get("/admin", protect, authorize("society_admin"), enforceTenant, adminDashboard);
router.get("/resident", protect, authorize("resident"), enforceTenant, residentDashboard);
router.get("/super-admin", protect, authorize("super_admin"), superAdminDashboard);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id/read", protect, markNotificationRead);

export default router;

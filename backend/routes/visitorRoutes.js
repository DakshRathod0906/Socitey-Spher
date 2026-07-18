import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import {
  createVisit,
  getVisits,
  cancelVisit,
  createGateRequest,
  respondToGateRequest,
  verifyVisit,
  checkIn,
  checkOut,
  getTodayMetrics
} from "../controllers/visitorController.js";

const router = express.Router();

// Apply auth and tenant middleware to all routes
router.use(protect);
router.use(enforceTenant);

// Resident creates pre-approved pass
router.post("/", authorize("resident"), createVisit);

// View visits
router.get("/", authorize("resident", "security", "society_admin", "super_admin"), getVisits);

// Get today's metrics
router.get("/today", authorize("security"), getTodayMetrics);

// Resident cancels pass
router.patch("/:id/cancel", authorize("resident"), cancelVisit);

// Security logs a walk-in gate request
router.post("/gate-request", authorize("security"), createGateRequest);

// Resident responds to gate request
router.patch("/:id/respond", authorize("resident"), respondToGateRequest);

// Security verifies token
router.post("/verify", authorize("security"), verifyVisit);

// Security check-in
router.post("/check-in", authorize("security"), checkIn);

// Security check-out
router.post("/:id/check-out", authorize("security"), checkOut);

export default router;

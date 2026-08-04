import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getDashboard,
  getComplaintsSummary,
  getExpensesSummary,
  getVisitorsSummary,
  getVehiclesSummary,
  getUsersSummary,
  getPipelineStatus,
  getPredictions,
  trainML,
} from "../controllers/analyticsController.js";

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/predictions", getPredictions);
router.get("/complaints", getComplaintsSummary);
router.get("/expenses", getExpensesSummary);
router.get("/visitors", getVisitorsSummary);
router.get("/vehicles", getVehiclesSummary);
router.get("/users", getUsersSummary);
router.get("/pipeline", getPipelineStatus);
router.post("/train", authorize("society_admin", "super_admin"), trainML);

export default router;

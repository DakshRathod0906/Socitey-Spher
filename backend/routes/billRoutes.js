import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import {
  generateBills,
  listBills,
  getBillDetails,
  cancelBill,
  addLateFee,
  getDashboardSummary
} from "../controllers/billController.js";

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

// Dashboard
router.get("/dashboard/summary", authorize("society_admin"), getDashboardSummary);

// Bill Listing & Details (Both Admin and Resident)
router.get("/", listBills);
router.get("/:id", getBillDetails);

// Admin-only actions
router.post("/generate", authorize("society_admin"), generateBills);
router.patch("/:id/cancel", authorize("society_admin"), cancelBill);
router.post("/:id/add-late-fee", authorize("society_admin"), addLateFee);

export default router;

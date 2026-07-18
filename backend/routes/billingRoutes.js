import express from "express";
import {
  generateMonthlyBills,
  listBills,
  payBill,
  applyLateFees,
  recordExpense,
  listExpenses,
} from "../controllers/billingController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.post("/generate", protect, authorize("society_admin"), enforceTenant, generateMonthlyBills);
router.get("/", protect, enforceTenant, listBills);
router.put("/:id/pay", protect, enforceTenant, payBill);
router.put("/apply-late-fees", protect, authorize("society_admin"), enforceTenant, applyLateFees);
router.post("/expenses", protect, authorize("society_admin"), enforceTenant, recordExpense);
router.get("/expenses", protect, authorize("society_admin"), enforceTenant, listExpenses);

export default router;

import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import {
  createExpense,
  listExpenses,
  getExpenseDetails,
  updateExpenseStatus,
} from "../controllers/expenseController.js";

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

// Only admins can manage expenses
router.use(authorize("society_admin"));

router.post("/", createExpense);
router.get("/", listExpenses);
router.get("/:id", getExpenseDetails);
router.patch("/:id/status", updateExpenseStatus);

export default router;

import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import {
  recordPayment,
  listPayments,
  getReceiptMetadata
} from "../controllers/paymentController.js";

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

router.post("/", recordPayment); // Residents can pay online, Admins can record offline
router.get("/", listPayments);
router.get("/:id/receipt", getReceiptMetadata);

export default router;

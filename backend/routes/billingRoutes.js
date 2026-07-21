import express from "express";
import billRoutes from "./billRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import expenseRoutes from "./expenseRoutes.js";

const router = express.Router();

router.use("/bills", billRoutes);
router.use("/payments", paymentRoutes);
router.use("/expenses", expenseRoutes);

export default router;

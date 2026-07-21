import mongoose from "mongoose";
import dotenv from "dotenv";
import * as BillGenerationService from "./services/billing/BillGenerationService.js";
import * as BillService from "./services/billing/BillService.js";
import * as PaymentService from "./services/billing/PaymentService.js";
import * as BillingDashboardService from "./services/billing/BillingDashboardService.js";
import Society from "./models/Society.js";
import User from "./models/User.js";
import Occupancy from "./models/Occupancy.js";

dotenv.config();

const runTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const society = await Society.findOne();
    if (!society) throw new Error("No society found to test with");

    const admin = await User.findOne({ societyId: society._id, role: "society_admin" });
    if (!admin) throw new Error("No admin found");

    const occupancy = await Occupancy.findOne({ societyId: society._id, status: "active" });
    if (!occupancy) throw new Error("No active occupancy found to bill");

    console.log("Testing Bulk Generation...");
    const billingCycle = new Date();
    // For test, remove existing to prevent duplicate error
    await mongoose.connection.collection("bills").deleteMany({ societyId: society._id, billingCycle });

    const genResult = await BillGenerationService.bulkGenerateBills({
      societyId: society._id,
      billingCycle,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      items: [
        { type: "MAINTENANCE", description: "Monthly Maintenance", amount: 2500 }
      ],
      generatedBy: admin._id
    });
    console.log("Bills generated:", genResult.count);

    console.log("Testing Record Payment...");
    const firstBill = genResult.bills[0];
    const payment = await PaymentService.recordPayment({
      societyId: society._id,
      billId: firstBill._id,
      paidBy: firstBill.residentId,
      amount: 1000,
      paymentMethod: "UPI",
      referenceNumber: "UPI123456789",
      paymentDate: new Date(),
      recordedBy: admin._id
    });
    console.log("Payment recorded:", payment.receiptNumber);

    console.log("Testing Add Late Fee...");
    await BillService.addLateFee(firstBill._id, society._id, admin._id, 150);
    console.log("Late fee added");

    console.log("Testing Dashboard Summary...");
    const summary = await BillingDashboardService.getDashboardSummary(society._id);
    console.log("Dashboard Summary:", summary);

    console.log("✅ All billing tests passed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
};

runTests();

import mongoose from "mongoose";
import dotenv from "dotenv";
import * as BillGenerationService from "./services/billing/BillGenerationService.js";
import * as BillService from "./services/billing/BillService.js";
import * as PaymentService from "./services/billing/PaymentService.js";
import * as ExpenseService from "./services/billing/ExpenseService.js";
import * as BillingDashboardService from "./services/billing/BillingDashboardService.js";
import Society from "./models/Society.js";
import User from "./models/User.js";
import Occupancy from "./models/Occupancy.js";
import Flat from "./models/Flat.js";
import Tower from "./models/Tower.js";
import Bill from "./models/Bill.js";
import Payment from "./models/Payment.js";
import Expense from "./models/Expense.js";

dotenv.config();

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ ${message}`);
};

const runTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("--- MongoDB Connected ---");

    // 1. Setup Mock Data (Idempotent)
    let society = await Society.findOneAndUpdate(
      { name: "Test Society" },
      { $set: { address: "Test", registrationNumber: "123", contactEmail: "test@test.com", contactPhone: "1234567890", totalTowers: 1, totalFlats: 1, status: "ACTIVE" } },
      { upsert: true, new: true }
    );

    const tower = await Tower.findOneAndUpdate(
      { societyId: society._id, name: "A" },
      { $set: { floors: 1, flatsPerFloor: 2 } },
      { upsert: true, new: true }
    );

    const flat = await Flat.findOneAndUpdate(
      { societyId: society._id, flatNumber: "101" },
      { $set: { towerId: tower._id, floor: 1, type: "2BHK", status: "occupied" } },
      { upsert: true, new: true }
    );

    const flat2 = await Flat.findOneAndUpdate(
      { societyId: society._id, flatNumber: "102" },
      { $set: { towerId: tower._id, floor: 1, type: "2BHK", status: "occupied" } },
      { upsert: true, new: true }
    );

    const admin = await User.findOneAndUpdate(
      { email: "adminb@test.com" },
      { $set: { societyId: society._id, name: "Admin", password: "pwd", role: "society_admin" } },
      { upsert: true, new: true }
    );

    const resident = await User.findOneAndUpdate(
      { email: "resb@test.com" },
      { $set: { societyId: society._id, flatId: flat._id, name: "Resident", password: "pwd", role: "resident" } },
      { upsert: true, new: true }
    );

    const resident2 = await User.findOneAndUpdate(
      { email: "res2@test.com" },
      { $set: { societyId: society._id, flatId: flat2._id, name: "Res2", password: "pwd", role: "resident" } },
      { upsert: true, new: true }
    );

    const occupancy = await Occupancy.findOneAndUpdate(
      { userId: resident._id },
      { $set: { societyId: society._id, flatId: flat._id, occupancyType: "OWNER", residentType: "PRIMARY", status: "ACTIVE", moveInDate: new Date() } },
      { upsert: true, new: true }
    );

    const occupancy2 = await Occupancy.findOneAndUpdate(
      { userId: resident2._id },
      { $set: { societyId: society._id, flatId: flat2._id, occupancyType: "OWNER", residentType: "PRIMARY", status: "ACTIVE", moveInDate: new Date() } },
      { upsert: true, new: true }
    );

    // Clean DB
    await Bill.deleteMany({ societyId: society._id });
    await Payment.deleteMany({ societyId: society._id });
    await Expense.deleteMany({ societyId: society._id });

    // --- TEST: Bill Generation ---
    const billingCycle = new Date();
    billingCycle.setDate(1);
    billingCycle.setHours(0, 0, 0, 0);

    const items = [{ type: "MAINTENANCE", description: "Maintenance", amount: 2500 }];
    
    let genResult = await BillGenerationService.bulkGenerateBills({
      societyId: society._id,
      billingCycle,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 10 * 86400000),
      items,
      generatedBy: admin._id
    });
    assert(genResult.count === 2, "Generates one bill per occupied flat");
    assert(genResult.bills[0].billNumber.startsWith("BILL-"), "Correct bill numbers generated");
    assert(genResult.bills[0].status === "PENDING", "Initial status is PENDING");

    // TEST: Duplicate prevention
    try {
      await BillGenerationService.bulkGenerateBills({ societyId: society._id, billingCycle, issueDate: new Date(), dueDate: new Date(), items, generatedBy: admin._id });
      assert(false, "Duplicate prevention failed");
    } catch (e) {
      assert(e.message.includes("already generated") || e.code === 11000, "Duplicate prevention works");
    }

    // --- TEST: Payments ---
    const billId = genResult.bills.find(b => b.flatId.toString() === flat._id.toString())._id;

    // Partial Payment
    let p1 = await PaymentService.recordPayment({
      societyId: society._id, billId, paidBy: resident._id, amount: 1000, paymentMethod: "UPI", paymentDate: new Date(), recordedBy: admin._id
    });
    assert(p1.receiptNumber.startsWith("RCPT-"), "Receipt number generated");
    let bill = await Bill.findById(billId);
    assert(bill.amountPaid === 1000 && bill.status === "PARTIAL", "Partial payment updates status to PARTIAL");

    // Overpayment Rejected
    try {
      await PaymentService.recordPayment({
        societyId: society._id, billId, paidBy: resident._id, amount: 2000, paymentMethod: "UPI", paymentDate: new Date(), recordedBy: admin._id
      });
      assert(false, "Overpayment should be rejected");
    } catch(e) {
      assert(e.message.includes("Bill is already fully paid") || e.message.includes("Overpayment"), "Overpayment rejected");
    }

    // Full Payment
    await PaymentService.recordPayment({
      societyId: society._id, billId, paidBy: resident._id, amount: 1500, paymentMethod: "UPI", paymentDate: new Date(), recordedBy: admin._id
    });
    bill = await Bill.findById(billId);
    assert(bill.amountPaid === 2500 && bill.status === "PAID", "Full payment updates status to PAID");

    // Cancelled bill rejects payment
    const billId2 = genResult.bills.find(b => b.flatId.toString() === flat2._id.toString())._id;
    await BillService.cancelBill(billId2, society._id, admin._id);
    
    try {
      await PaymentService.recordPayment({
        societyId: society._id, billId: billId2, paidBy: resident2._id, amount: 500, paymentMethod: "UPI", paymentDate: new Date(), recordedBy: admin._id
      });
      assert(false, "Cancelled bill accepted payment");
    } catch(e) {
      assert(e.message.includes("cancelled"), "Cancelled bill rejects payment");
    }

    // --- TEST: Late Fee ---
    // Create a new overdue bill for late fee test
    const overdueCycle = new Date();
    overdueCycle.setMonth(overdueCycle.getMonth() - 1);
    overdueCycle.setDate(1);
    overdueCycle.setHours(0, 0, 0, 0);
    
    let genResult3 = await BillGenerationService.bulkGenerateBills({
      societyId: society._id, billingCycle: overdueCycle, issueDate: new Date(), dueDate: new Date(), items, generatedBy: admin._id
    });
    const billId3 = genResult3.bills.find(b => b.flatId.toString() === flat._id.toString())._id;
    
    await BillService.addLateFee(billId3, society._id, admin._id, 200);
    bill = await Bill.findById(billId3);
    assert(bill.lateFee === 200 && bill.totalAmount === 2700, "Late fee applied and updates total amount");
    
    try {
      await BillService.addLateFee(billId3, society._id, admin._id, 100);
      bill = await Bill.findById(billId3);
      assert(bill.lateFee === 300 && bill.totalAmount === 2800, "Late fee can be applied cumulatively");
    } catch(e) {
      assert(false, "Cumulative late fee failed");
    }

    // --- TEST: Expenses ---
    const expense = await ExpenseService.createExpense({
      societyId: society._id, title: "Plumbing", category: "MAINTENANCE", amount: 500, expenseDate: new Date(), recordedBy: admin._id
    });
    assert(expense.category === "MAINTENANCE", "Expense CRUD and category validation works");

    // --- TEST: Dashboard ---
    const summary = await BillingDashboardService.getDashboardSummary(society._id);
    // Bills: 
    // Cycle 1: flat 1 (2500, paid 2500), flat 2 (2500, cancelled)
    // Cycle 2: flat 1 (2500, late 300 = 2800, unpaid), flat 2 (2500, unpaid)
    // Total Billed = 2500 + 2800 + 2500 = 7800
    // Total Collected = 2500
    // Outstanding = 7800 - 2500 = 5300
    assert(summary.totalBilled === 7800, `Dashboard Total Billed correct. Expected 7800, got ${summary.totalBilled}`);
    assert(summary.totalCollected === 2500, `Dashboard Total Collected correct. Expected 2500, got ${summary.totalCollected}`);
    assert(summary.outstanding === 5300, `Dashboard Outstanding correct. Expected 5300, got ${summary.outstanding}`);
    assert(summary.monthlyExpenses === 500, `Dashboard Expenses correct. Expected 500, got ${summary.monthlyExpenses}`);
    assert(summary.netBalance === 2000, `Dashboard Net Balance correct. Expected 2000, got ${summary.netBalance}`);

    console.log("--- ALL END-TO-END TESTS PASSED ---");

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("--- MongoDB Disconnected ---");
  }
};

runTests();

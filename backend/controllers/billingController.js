import MaintenanceBill from "../models/MaintenanceBill.js";
import Expense from "../models/Expense.js";
import Flat from "../models/Flat.js";
import Notification from "../models/Notification.js";
import { generateCode } from "../utils/idGenerator.js";

// @desc   Generate monthly maintenance bills for all occupied flats
// @route  POST /api/billing/generate
export const generateMonthlyBills = async (req, res, next) => {
  try {
    const { billMonth, billYear, dueDate } = req.body;
    if (!billMonth || !billYear || !dueDate) {
      res.status(400);
      throw new Error("Bill month, year, and due date are required");
    }

    const flats = await Flat.find({
      societyId: req.societyId,
      occupancyStatus: { $ne: "vacant" },
    });

    const created = [];
    for (const flat of flats) {
      const existing = await MaintenanceBill.findOne({
        flatId: flat._id,
        billMonth,
        billYear,
      });
      if (existing) continue;

      // Resident lookup is intentionally left to a join at read-time;
      // here we require a residentId to be attached via the flat's occupant.
      const User = (await import("../models/User.js")).default;
      const resident = await User.findOne({ flatId: flat._id, role: "resident" });
      if (!resident) continue;

      const bill = await MaintenanceBill.create({
        societyId: req.societyId,
        flatId: flat._id,
        residentId: resident._id,
        billMonth,
        billYear,
        amount: flat.maintenanceAmount,
        totalAmount: flat.maintenanceAmount,
        dueDate,
      });

      await Notification.create({
        societyId: req.societyId,
        userId: resident._id,
        title: "Maintenance bill generated",
        message: `Your maintenance bill for ${billMonth}/${billYear} of amount ₹${flat.maintenanceAmount} is now due.`,
        type: "billing",
        linkId: bill._id,
      });

      created.push(bill);
    }

    res.status(201).json({ message: `${created.length} bill(s) generated`, bills: created });
  } catch (err) {
    next(err);
  }
};

// @desc   List bills (scoped by role)
// @route  GET /api/billing
export const listBills = async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "resident") filter.residentId = req.user._id;

    const bills = await MaintenanceBill.find(filter)
      .populate("flatId", "flatNumber")
      .populate("residentId", "name")
      .sort({ billYear: -1, billMonth: -1 });

    res.json(bills);
  } catch (err) {
    next(err);
  }
};

// @desc   Mark bill as paid (records payment + generates receipt)
// @route  PUT /api/billing/:id/pay
export const payBill = async (req, res, next) => {
  try {
    const { paymentMode } = req.body;

    const filter = { _id: req.params.id, societyId: req.societyId };
    if (req.user.role === "resident") filter.residentId = req.user._id;

    const bill = await MaintenanceBill.findOne(filter);
    if (!bill) {
      res.status(404);
      throw new Error("Bill not found");
    }
    if (bill.status === "paid") {
      res.status(400);
      throw new Error("This bill has already been paid");
    }

    bill.status = "paid";
    bill.paidAt = new Date();
    bill.paymentMode = paymentMode || "online";
    bill.receiptNumber = generateCode("RCPT");
    await bill.save();

    res.json(bill);
  } catch (err) {
    next(err);
  }
};

// @desc   Apply late fee to overdue unpaid bills
// @route  PUT /api/billing/apply-late-fees
export const applyLateFees = async (req, res, next) => {
  try {
    const { lateFeeAmount } = req.body;
    const today = new Date();

    const overdue = await MaintenanceBill.find({
      societyId: req.societyId,
      status: "unpaid",
      dueDate: { $lt: today },
    });

    for (const bill of overdue) {
      bill.status = "overdue";
      bill.lateFee = lateFeeAmount || 100;
      bill.totalAmount = bill.amount + bill.lateFee;
      await bill.save();
    }

    res.json({ message: `Late fees applied to ${overdue.length} bill(s)` });
  } catch (err) {
    next(err);
  }
};

// @desc   Record a society expense
// @route  POST /api/billing/expenses
export const recordExpense = async (req, res, next) => {
  try {
    const { category, description, amount, expenseDate } = req.body;
    if (!category || !amount) {
      res.status(400);
      throw new Error("Category and amount are required");
    }

    const expense = await Expense.create({
      societyId: req.societyId,
      category,
      description,
      amount,
      expenseDate: expenseDate || new Date(),
      recordedBy: req.user._id,
    });

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

// @desc   List expenses
// @route  GET /api/billing/expenses
export const listExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ societyId: req.societyId }).sort({ expenseDate: -1 });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};

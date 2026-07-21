import Bill from "../../models/Bill.js";
import Payment from "../../models/Payment.js";
import Expense from "../../models/Expense.js";

export const getDashboardSummary = async (societyId) => {
  // Aggregate Total Billed
  const billsAggr = await Bill.aggregate([
    { $match: { societyId, status: { $ne: "CANCELLED" } } },
    { $group: { _id: null, totalBilled: { $sum: "$totalAmount" }, totalCollected: { $sum: "$amountPaid" } } }
  ]);
  
  const totalBilled = billsAggr[0]?.totalBilled || 0;
  const totalCollectedFromBills = billsAggr[0]?.totalCollected || 0;
  const outstanding = totalBilled - totalCollectedFromBills;

  // Actual collected from successful payments
  const paymentsAggr = await Payment.aggregate([
    { $match: { societyId, status: "SUCCESS" } },
    { $group: { _id: null, totalCollected: { $sum: "$amount" } } }
  ]);
  const totalCollected = paymentsAggr[0]?.totalCollected || 0;

  // Overdue count
  const overdueBillsCount = await Bill.countDocuments({
    societyId,
    status: "OVERDUE"
  });

  // Calculate collection rate
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(2) : 0;

  // Current month's expenses
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const expensesAggr = await Expense.aggregate([
    { $match: { societyId, status: "APPROVED", expenseDate: { $gte: startOfMonth } } },
    { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
  ]);
  const monthlyExpenses = expensesAggr[0]?.totalExpense || 0;

  const netBalance = totalCollected - monthlyExpenses;

  return {
    totalBilled,
    totalCollected,
    outstanding,
    overdueBillsCount,
    collectionRate: Number(collectionRate),
    monthlyExpenses,
    netBalance
  };
};

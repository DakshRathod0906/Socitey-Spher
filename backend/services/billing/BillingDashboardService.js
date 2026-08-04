import Bill from "../../models/Bill.js";
import Payment from "../../models/Payment.js";
import Expense from "../../models/Expense.js";

export const getDashboardSummary = async (societyId) => {
  // Aggregate Total Billed & Collected from Bills
  const billsAggr = await Bill.aggregate([
    { $match: { societyId, status: { $ne: "CANCELLED" } } },
    {
      $group: {
        _id: null,
        totalBilled: { $sum: "$totalAmount" },
        totalCollectedFromBills: {
          $sum: {
            $cond: [
              { $eq: ["$status", "PAID"] },
              { $cond: [{ $gt: ["$amountPaid", 0] }, "$amountPaid", "$totalAmount"] },
              { $ifNull: ["$amountPaid", 0] }
            ]
          }
        }
      }
    }
  ]);
  
  const totalBilled = billsAggr[0]?.totalBilled || 0;
  const totalCollectedFromBills = billsAggr[0]?.totalCollectedFromBills || 0;

  // Actual collected from successful payments
  const paymentsAggr = await Payment.aggregate([
    { $match: { societyId, status: "SUCCESS" } },
    { $group: { _id: null, totalCollected: { $sum: "$amount" } } }
  ]);
  const totalCollectedFromPayments = paymentsAggr[0]?.totalCollected || 0;

  const totalCollected = Math.max(totalCollectedFromPayments, totalCollectedFromBills);
  const outstanding = Math.max(0, totalBilled - totalCollected);

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

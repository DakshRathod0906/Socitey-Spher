import Expense from "../../models/Expense.js";

export const createExpense = async ({ societyId, title, category, amount, expenseDate, vendorName, receiptUrl, recordedBy }) => {
  const expense = new Expense({
    societyId,
    title,
    category,
    amount,
    expenseDate: new Date(expenseDate),
    vendorName,
    receiptUrl,
    recordedBy,
    status: "APPROVED" // Assuming direct approval by admin for now
  });

  await expense.save();
  return expense;
};

export const getExpenses = async ({ societyId, category, status, page = 1, limit = 20 }) => {
  const query = { societyId };
  
  if (category) query.category = category;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const expenses = await Expense.find(query)
    .populate("recordedBy", "name email")
    .sort({ expenseDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Expense.countDocuments(query);

  return {
    expenses,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

export const getExpenseDetails = async (expenseId, societyId) => {
  const expense = await Expense.findOne({ _id: expenseId, societyId })
    .populate("recordedBy", "name email");

  if (!expense) throw new Error("Expense not found");

  return expense;
};

import * as ExpenseService from "../services/billing/ExpenseService.js";

export const createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, expenseDate, vendorName, receiptUrl } = req.body;
    
    const result = await ExpenseService.createExpense({
      societyId: req.societyId,
      title,
      category,
      amount,
      expenseDate,
      vendorName,
      receiptUrl,
      recordedBy: req.user._id
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const listExpenses = async (req, res, next) => {
  try {
    const { category, status, page, limit } = req.query;
    
    const result = await ExpenseService.getExpenses({
      societyId: req.societyId,
      category,
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getExpenseDetails = async (req, res, next) => {
  try {
    const result = await ExpenseService.getExpenseDetails(req.params.id, req.societyId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

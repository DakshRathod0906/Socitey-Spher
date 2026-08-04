import * as BillService from "../services/billing/BillService.js";
import * as BillGenerationService from "../services/billing/BillGenerationService.js";
import * as BillingDashboardService from "../services/billing/BillingDashboardService.js";

export const generateBills = async (req, res, next) => {
  try {
    const { billingCycle, issueDate, dueDate, items } = req.body;
    const result = await BillGenerationService.bulkGenerateBills({
      societyId: req.societyId,
      billingCycle,
      issueDate,
      dueDate,
      items,
      generatedBy: req.user._id
    });
    res.status(201).json({ success: true, message: `Successfully generated ${result.count} maintenance invoices!`, data: result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const listBills = async (req, res, next) => {
  try {
    const { status, flatId, page, limit } = req.query;
    const result = await BillService.getBills({
      societyId: req.societyId,
      status,
      flatId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getBillById = async (req, res, next) => {
  try {
    const bill = await BillService.getBillById(req.params.id, req.societyId);
    res.json({ success: true, data: bill });
  } catch (err) {
    next(err);
  }
};

export const getBillDetails = getBillById;

export const addLateFee = async (req, res, next) => {
  try {
    const rawAmount = req.body.feeAmount ?? req.body.lateFeeAmount;
    const feeAmount = parseFloat(rawAmount);
    if (isNaN(feeAmount) || feeAmount <= 0) {
      return res.status(400).json({ message: "Please provide a valid positive late fee amount" });
    }
    const bill = await BillService.addLateFee(req.params.id, req.societyId, req.user?._id, feeAmount);
    res.json({ success: true, data: bill });
  } catch (err) {
    next(err);
  }
};

export const cancelBill = async (req, res, next) => {
  try {
    const bill = await BillService.cancelBill(req.params.id, req.societyId, req.user?._id);
    res.json({ success: true, data: bill });
  } catch (err) {
    next(err);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await BillingDashboardService.getDashboardSummary(req.societyId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

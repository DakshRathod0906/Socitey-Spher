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
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const listBills = async (req, res, next) => {
  try {
    const { status, flatId, page, limit } = req.query;
    const result = await BillService.getBills({
      societyId: req.societyId,
      role: req.user.role,
      residentId: req.user._id,
      status,
      flatId,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getBillDetails = async (req, res, next) => {
  try {
    const result = await BillService.getBillDetails(req.params.id, req.societyId, req.user._id, req.user.role);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const cancelBill = async (req, res, next) => {
  try {
    const result = await BillService.cancelBill(req.params.id, req.societyId, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const addLateFee = async (req, res, next) => {
  try {
    const { feeAmount } = req.body;
    const result = await BillService.addLateFee(req.params.id, req.societyId, req.user._id, feeAmount);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const result = await BillingDashboardService.getDashboardSummary(req.societyId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

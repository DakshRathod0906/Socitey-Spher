import * as PaymentService from "../services/billing/PaymentService.js";

export const recordPayment = async (req, res, next) => {
  try {
    const { billId, amount, paymentMethod, referenceNumber, paymentDate, paymentProofUrl } = req.body;
    
    // For admin recording resident payments, they might provide a specific resident ID. 
    // If not provided, default to the currently logged in user (if resident).
    const paidBy = req.body.paidBy || req.user._id;

    const result = await PaymentService.recordPayment({
      societyId: req.societyId,
      billId,
      paidBy,
      amount,
      paymentMethod,
      referenceNumber,
      paymentDate,
      paymentProofUrl,
      recordedBy: req.user._id
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const listPayments = async (req, res, next) => {
  try {
    const { billId, page, limit } = req.query;
    const result = await PaymentService.getPayments({
      societyId: req.societyId,
      role: req.user.role,
      residentId: req.user._id,
      billId,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getReceiptMetadata = async (req, res, next) => {
  try {
    const result = await PaymentService.getReceiptMetadata(req.params.id, req.societyId, req.user._id, req.user.role);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

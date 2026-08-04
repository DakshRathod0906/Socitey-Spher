import Payment from "../../models/Payment.js";
import Bill from "../../models/Bill.js";
import { generateReceiptNumber } from "./ReceiptService.js";

export const recordPayment = async ({
  societyId,
  billId,
  paidBy,
  amount,
  paymentMethod,
  referenceNumber,
  paymentDate,
  paymentProofUrl,
  recordedBy
}) => {
  const parsedDate = new Date(paymentDate || Date.now());
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid payment date");
  }

  const allowedMethods = ["UPI", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "ONLINE", "CASH", "CHEQUE"];
  if (!allowedMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  const bill = await Bill.findOne({ _id: billId, societyId });
  if (!bill) throw new Error("Bill not found");

  if (bill.status === "CANCELLED") {
    throw new Error("Cannot record payment for a cancelled bill");
  }

  if (bill.status === "PAID" || (bill.amountPaid >= bill.totalAmount && bill.totalAmount > 0)) {
    throw new Error("Bill is already fully paid");
  }

  const payAmount = amount || bill.totalAmount;
  if (payAmount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const residentId = bill.residentId?._id || bill.residentId;
  const actualPaidBy = paidBy || residentId || recordedBy;

  let receiptNumber = `REC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  try {
    receiptNumber = await generateReceiptNumber(societyId, parsedDate);
  } catch (err) {
    console.warn("Receipt generator fallback used:", err.message);
  }

  const payment = new Payment({
    societyId,
    flatId: bill.flatId,
    paidBy: actualPaidBy,
    billId: bill._id,
    receiptNumber,
    amount: Math.round(payAmount * 100) / 100,
    paymentMethod: paymentMethod || "UPI",
    referenceNumber: referenceNumber || `TXN-${Date.now()}`,
    paymentDate: parsedDate,
    paymentProofUrl: paymentProofUrl || null,
    status: "SUCCESS",
    recordedBy: recordedBy || actualPaidBy
  });

  await payment.save();

  bill.amountPaid = Math.round(((bill.amountPaid || 0) + payAmount) * 100) / 100;
  bill.totalAmount = Math.round((bill.totalAmount || 0) * 100) / 100;

  if (bill.amountPaid >= bill.totalAmount) {
    bill.status = "PAID";
  } else if (bill.amountPaid > 0) {
    bill.status = "PARTIAL";
  }

  await bill.save();

  return payment;
};

export const getPayments = async ({ societyId, role, residentId, billId, page = 1, limit = 20 }) => {
  const query = { societyId };

  if (role === "resident") {
    query.paidBy = residentId;
  }
  
  if (billId) query.billId = billId;

  const skip = (page - 1) * limit;

  const payments = await Payment.find(query)
    .populate("flatId", "flatNumber block")
    .populate("paidBy", "name email phone")
    .populate("billId", "billNumber billingCycle")
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(query);

  return {
    payments,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

export const getReceiptMetadata = async (paymentId, societyId, residentId, role) => {
  const payment = await Payment.findOne({ _id: paymentId, societyId })
    .populate("flatId", "flatNumber block")
    .populate("paidBy", "name email")
    .populate("billId");

  if (!payment) throw new Error("Payment not found");

  if (role === "resident" && payment.paidBy._id.toString() !== residentId.toString()) {
    throw new Error("Not authorized to view this receipt");
  }

  return payment;
};

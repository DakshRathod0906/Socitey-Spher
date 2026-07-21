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
  // Validate payment date
  const parsedDate = new Date(paymentDate);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid payment date");
  }

  // Define allowed payment methods if they are not restricted by enum
  const allowedMethods = ["UPI", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "CASH", "CHEQUE"];
  if (!allowedMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  const session = await Payment.startSession();
  session.startTransaction();

  try {
    const bill = await Bill.findOne({ _id: billId, societyId })
      .populate("residentId")
      .session(session);
      
    if (!bill) throw new Error("Bill not found");

    // Validate paidBy matches resident or admin is recording
    if (paidBy.toString() !== bill.residentId._id.toString() && recordedBy.toString() !== paidBy.toString()) {
      // If paidBy is different from resident, it should be the admin recording it, but typically paidBy is the resident.
      // So we'll ensure paidBy is either the resident or we just log who paid.
      // Assuming paidBy must be the resident of the flat:
      if (paidBy.toString() !== bill.residentId._id.toString()) {
         throw new Error("Payment can only be made by the resident of the bill");
      }
    }

    if (bill.status === "CANCELLED") {
      throw new Error("Cannot record payment for a cancelled bill");
    }

    if (bill.amountPaid >= bill.totalAmount) {
      throw new Error("Bill is already fully paid");
    }

    if (bill.amountPaid + amount > bill.totalAmount) {
      throw new Error(`Overpayment rejected. Remaining balance is ${bill.totalAmount - bill.amountPaid}`);
    }

    if (amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    // 1. Generate Receipt using atomic counter
    const receiptNumber = await generateReceiptNumber(societyId, parsedDate, session);

    // 2. Create Payment
    const payment = new Payment({
      societyId,
      flatId: bill.flatId,
      paidBy,
      billId,
      receiptNumber,
      amount: Math.round(amount * 100) / 100, // round to 2 decimal places
      paymentMethod,
      referenceNumber,
      paymentDate: parsedDate,
      paymentProofUrl,
      status: "SUCCESS", // Defaulting to success for manual entry
      recordedBy
    });

    await payment.save({ session });

    // 3. Update Bill (Rounding to 2 decimals)
    bill.amountPaid = Math.round((bill.amountPaid + amount) * 100) / 100;
    bill.totalAmount = Math.round(bill.totalAmount * 100) / 100;

    if (bill.amountPaid >= bill.totalAmount) {
      bill.status = "PAID";
    } else if (bill.amountPaid > 0) {
      bill.status = "PARTIAL";
    }

    await bill.save({ session });

    // 4. Audit Log
    // await AuditLog.create(...)

    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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

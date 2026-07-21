import Bill from "../../models/Bill.js";
import Payment from "../../models/Payment.js";

export const getBills = async ({ societyId, role, residentId, status, flatId, page = 1, limit = 20 }) => {
  const query = { societyId };

  if (role === "resident") {
    query.residentId = residentId;
  }
  
  if (status) query.status = status;
  if (flatId) query.flatId = flatId;

  const skip = (page - 1) * limit;

  const bills = await Bill.find(query)
    .populate("flatId", "flatNumber block")
    .populate("residentId", "name email phone")
    .sort({ billingCycle: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Bill.countDocuments(query);

  return {
    bills,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

export const getBillDetails = async (billId, societyId, residentId, role) => {
  const bill = await Bill.findOne({ _id: billId, societyId })
    .populate("flatId", "flatNumber block")
    .populate("residentId", "name email phone");

  if (!bill) throw new Error("Bill not found");

  if (role === "resident" && bill.residentId._id.toString() !== residentId.toString()) {
    throw new Error("Not authorized to view this bill");
  }

  // Fetch linked payments
  const payments = await Payment.find({ billId, societyId }).sort({ paymentDate: -1 });

  return { bill, payments };
};

export const cancelBill = async (billId, societyId, adminId) => {
  const bill = await Bill.findOne({ _id: billId, societyId });
  if (!bill) throw new Error("Bill not found");

  if (bill.amountPaid > 0) {
    throw new Error("Cannot cancel a bill that has received payments");
  }

  bill.status = "CANCELLED";
  await bill.save();

  // AuditLog could go here

  return bill;
};

export const addLateFee = async (billId, societyId, adminId, feeAmount) => {
  const session = await Bill.startSession();
  session.startTransaction();

  try {
    const bill = await Bill.findOne({ _id: billId, societyId }).session(session);
    if (!bill) throw new Error("Bill not found");

    if (bill.status === "CANCELLED") {
      throw new Error("Cannot add late fee to a cancelled bill");
    }

    if (bill.status === "PAID") {
      throw new Error("Cannot add late fee to a fully paid bill");
    }

    bill.lateFee += feeAmount;
    bill.totalAmount = bill.subTotal + bill.lateFee;

    // Status might change if it was previously PARTIAL and now totalAmount increased
    if (bill.amountPaid > 0) {
      bill.status = bill.amountPaid >= bill.totalAmount ? "PAID" : "PARTIAL";
    }

    await bill.save({ session });

    // AuditLog could go here

    await session.commitTransaction();
    session.endSession();

    return bill;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

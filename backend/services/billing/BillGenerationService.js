import Bill from "../../models/Bill.js";
import Occupancy from "../../models/Occupancy.js";
import Flat from "../../models/Flat.js";
import { generateBillNumber } from "./ReceiptService.js";

/**
 * Bulk generate maintenance bills for an entire society for a given billing cycle.
 */
export const bulkGenerateBills = async ({ societyId, billingCycle, issueDate, dueDate, items, generatedBy }) => {
  const session = await Bill.startSession();
  session.startTransaction();

  try {
    // 1. Find all active occupancies in the society
    const activeOccupancies = await Occupancy.find({ societyId, status: "ACTIVE" })
      .populate("flatId")
      .session(session);

    if (!activeOccupancies.length) {
      throw new Error("No active occupancies found in this society");
    }

    // 2. Validate duplicate generation for the same cycle
    const cycleDate = new Date(billingCycle);
    const existingBills = await Bill.find({
      societyId,
      billingCycle: cycleDate
    }).session(session);

    if (existingBills.length > 0) {
      throw new Error(`Bills already generated for this billing cycle (${cycleDate.toDateString()})`);
    }

    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);

    const newBills = [];
    let sequence = 1;

    // 3. Create bill for each active occupancy
    for (const occupancy of activeOccupancies) {
      const billNumber = await generateBillNumber(societyId, cycleDate, session);
      
      const bill = new Bill({
        societyId,
        flatId: occupancy.flatId._id,
        occupancyId: occupancy._id,
        residentId: occupancy.userId,
        billNumber,
        billingCycle: cycleDate,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        items,
        subTotal,
        lateFee: 0,
        totalAmount: subTotal,
        amountPaid: 0,
        status: "PENDING",
      });

      newBills.push(bill);
    }

    // 4. Insert all bills
    await Bill.insertMany(newBills, { session });

    // 5. Log audit event here if needed
    // await AuditLog.create({ action: "BULK_GENERATE_BILLS", user: generatedBy, societyId, details: { count: newBills.length } }, { session });

    await session.commitTransaction();
    session.endSession();

    return { count: newBills.length, bills: newBills };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

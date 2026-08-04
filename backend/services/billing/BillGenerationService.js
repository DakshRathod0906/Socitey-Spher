import Bill from "../../models/Bill.js";
import Occupancy from "../../models/Occupancy.js";
import Flat from "../../models/Flat.js";
import { generateBillNumber } from "./ReceiptService.js";

/**
 * Bulk generate maintenance bills for active residents/flats in a society.
 */
export const bulkGenerateBills = async ({ societyId, billingCycle, issueDate, dueDate, items, generatedBy }) => {
  if (!societyId) {
    const err = new Error("Society ID is missing. Please log in again or select a valid society.");
    err.statusCode = 400;
    throw err;
  }

  if (!billingCycle) {
    const err = new Error("Billing cycle date is required.");
    err.statusCode = 400;
    throw err;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    const err = new Error("At least one bill line item with a positive amount is required.");
    err.statusCode = 400;
    throw err;
  }

  // 1. Check for duplicate bill generation in the same billing cycle (month-based range)
  const cycleDate = new Date(billingCycle);
  if (isNaN(cycleDate.getTime())) {
    const err = new Error("Invalid billing cycle date provided.");
    err.statusCode = 400;
    throw err;
  }

  const startOfCycle = new Date(Date.UTC(cycleDate.getUTCFullYear(), cycleDate.getUTCMonth(), 1));
  const endOfCycle = new Date(Date.UTC(cycleDate.getUTCFullYear(), cycleDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  const existingBills = await Bill.find({
    societyId,
    billingCycle: { $gte: startOfCycle, $lte: endOfCycle },
  });

  if (existingBills.length > 0) {
    const monthName = cycleDate.toLocaleDateString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const err = new Error(`Bills have already been generated for ${monthName}. Select a different billing month.`);
    err.statusCode = 400;
    throw err;
  }

  // 2. Find targets for billing: active occupancies or flats in the society
  let activeOccupancies = await Occupancy.find({ societyId, status: "ACTIVE" }).populate("flatId");
  activeOccupancies = activeOccupancies.filter((occ) => occ && occ.flatId);

  let targetFlats = [];
  if (!activeOccupancies.length) {
    targetFlats = await Flat.find({ societyId });
    if (!targetFlats.length) {
      const err = new Error("No flats found in this society. Please create flats before generating bills.");
      err.statusCode = 400;
      throw err;
    }
  }

  // 3. Format line items to match Mongoose schema (mapping title -> description)
  const formattedItems = items.map((item) => {
    const titleLower = (item.title || item.description || "").toLowerCase();
    let itemType = "MAINTENANCE";
    if (titleLower.includes("water")) itemType = "WATER";
    else if (titleLower.includes("parking")) itemType = "PARKING";
    else if (titleLower.includes("sinking") || titleLower.includes("security")) itemType = "SINKING_FUND";
    else if (titleLower.includes("penalty")) itemType = "PENALTY";

    return {
      type: item.type || itemType,
      description: item.title || item.description || "Monthly Maintenance",
      amount: Number(item.amount) || 0,
    };
  });

  const subTotal = formattedItems.reduce((sum, item) => sum + item.amount, 0);
  const newBills = [];

  // 4. Create bills for each active occupancy or flat
  if (activeOccupancies.length > 0) {
    for (const occupancy of activeOccupancies) {
      const flatObj = occupancy.flatId;
      const flatId = flatObj?._id || flatObj;
      if (!flatId) continue;

      const billNumber = await generateBillNumber(societyId, cycleDate);

      const bill = new Bill({
        societyId,
        flatId,
        occupancyId: occupancy._id,
        residentId: occupancy.userId || null,
        billNumber,
        billingCycle: startOfCycle,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        items: formattedItems,
        subTotal,
        lateFee: 0,
        totalAmount: subTotal,
        amountPaid: 0,
        status: "PENDING",
      });

      newBills.push(bill);
    }
  } else {
    for (const flat of targetFlats) {
      const billNumber = await generateBillNumber(societyId, cycleDate);

      const bill = new Bill({
        societyId,
        flatId: flat._id,
        residentId: flat.tenantId || flat.ownerId || generatedBy || null,
        billNumber,
        billingCycle: startOfCycle,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        items: formattedItems,
        subTotal,
        lateFee: 0,
        totalAmount: subTotal,
        amountPaid: 0,
        status: "PENDING",
      });

      newBills.push(bill);
    }
  }

  // 5. Insert all bills using standard Mongoose CRUD
  if (newBills.length > 0) {
    await Bill.insertMany(newBills);
  }

  return { count: newBills.length, bills: newBills };
};

import Society from "../../models/Society.js";
import Counter from "../../models/Counter.js";

/**
 * Generates a unique Bill Number
 * Format: BILL-{SOC_CODE}-{YYYYMM}-{SEQ}
 */
export const generateBillNumber = async (societyId, billingCycle, session = null) => {
  const society = await Society.findById(societyId).session(session);
  const socCode = society ? society.name.substring(0, 3).toUpperCase() : "SOC";
  
  const year = billingCycle.getFullYear();
  const month = String(billingCycle.getMonth() + 1).padStart(2, '0');
  
  const counter = await Counter.findOneAndUpdate(
    { societyId, entity: `BILL_${year}${month}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
  
  const seqStr = String(counter.seq).padStart(4, '0');
  
  return `BILL-${socCode}-${year}${month}-${seqStr}`;
};

/**
 * Generates a unique Receipt Number
 * Format: RCPT-{SOC_CODE}-{YYYYMM}-{SEQ}
 */
export const generateReceiptNumber = async (societyId, date = new Date(), session = null) => {
  const society = await Society.findById(societyId).session(session);
  const socCode = society ? society.name.substring(0, 3).toUpperCase() : "SOC";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const counter = await Counter.findOneAndUpdate(
    { societyId, entity: `RECEIPT_${year}${month}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
  
  const seqStr = String(counter.seq).padStart(6, '0');
  
  return `RCPT-${socCode}-${year}${month}-${seqStr}`;
};

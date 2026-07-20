import Counter from "../../models/Counter.js";

/**
 * Generates a human-readable complaint number: CMP-YYYY-NNNNNN
 * Uses the Counter model for atomic sequence generation.
 */
export const generateComplaintNumber = async (societyId) => {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { societyId, entity: "COMPLAINT" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const padded = String(counter.seq).padStart(6, "0");
  return `CMP-${year}-${padded}`;
};

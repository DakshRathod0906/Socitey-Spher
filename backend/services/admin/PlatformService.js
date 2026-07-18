import Society from "../../models/Society.js";
import eventBus from "../../events/eventBus.js";
import { EVENTS } from "../../events/events.js";

export const getPendingSocieties = async () => {
  return await Society.find({ status: { $in: ["SUBMITTED", "UNDER_REVIEW"] } }).sort({ createdAt: -1 });
};

export const getActiveSocieties = async () => {
  return await Society.find({ status: "ACTIVE" }).sort({ createdAt: -1 });
};

export const approveSociety = async (societyId, superAdminId) => {
  const society = await Society.findById(societyId);
  if (!society) {
    const error = new Error("Society not found");
    error.status = 404;
    throw error;
  }

  if (society.status !== "SUBMITTED" && society.status !== "UNDER_REVIEW") {
    const error = new Error("Only submitted or under review societies can be approved");
    error.status = 400;
    throw error;
  }

  society.status = "APPROVED";
  society.reviewedBy = superAdminId;
  society.reviewedAt = new Date();
  await society.save();

  // Find the admin user and move pendingSocietyId to societyId
  const User = (await import("../../models/User.js")).default;
  const adminUser = await User.findOneAndUpdate(
    { pendingSocietyId: society._id, role: "society_admin" },
    { $set: { societyId: society._id }, $unset: { pendingSocietyId: 1 } },
    { new: true }
  );

  eventBus.emit(EVENTS.SOCIETY_APPROVED, { society, adminUser });

  return society;
};

export const rejectSociety = async (societyId, superAdminId, reason) => {
  const society = await Society.findById(societyId);
  if (!society) {
    const error = new Error("Society not found");
    error.status = 404;
    throw error;
  }

  if (society.status !== "SUBMITTED" && society.status !== "UNDER_REVIEW") {
    const error = new Error("Only submitted or under review societies can be rejected");
    error.status = 400;
    throw error;
  }

  society.status = "REJECTED";
  society.reviewedBy = superAdminId;
  society.reviewedAt = new Date();
  if (reason) {
    society.rejectionReason = reason;
  }
  await society.save();

  const User = (await import("../../models/User.js")).default;
  const adminUser = await User.findOne({ pendingSocietyId: society._id, role: "society_admin" });

  eventBus.emit(EVENTS.SOCIETY_REJECTED, { society, adminUser, reason });

  return society;
};

export const suspendSociety = async (societyId) => {
  const society = await Society.findById(societyId);
  if (!society) {
    const error = new Error("Society not found");
    error.status = 404;
    throw error;
  }

  if (society.status !== "ACTIVE") {
    const error = new Error("Only active societies can be suspended");
    error.status = 400;
    throw error;
  }

  society.status = "SUSPENDED";
  await society.save();
  
  eventBus.emit(EVENTS.SOCIETY_SUSPENDED, { society });
  
  return society;
};

export const reactivateSociety = async (societyId) => {
  const society = await Society.findById(societyId);
  if (!society) {
    const error = new Error("Society not found");
    error.status = 404;
    throw error;
  }

  if (society.status !== "SUSPENDED") {
    const error = new Error("Only suspended societies can be reactivated");
    error.status = 400;
    throw error;
  }

  society.status = "ACTIVE";
  await society.save();
  return society;
};

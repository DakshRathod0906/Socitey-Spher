import User from "../../models/User.js";
import Occupancy from "../../models/Occupancy.js";
import WorkOrder from "../../models/WorkOrder.js";

/**
 * Get all users for a society
 * @param {string} societyId 
 * @param {string} accountStatus 
 */
export const getSocietyUsers = async (societyId, accountStatus = "ACTIVE") => {
  const query = { societyId, role: { $ne: "super_admin" } };
  
  if (accountStatus) {
    query.accountStatus = accountStatus;
  }

  return await User.find(query).select("-password").sort({ createdAt: -1 });
};

/**
 * Get all society admins (For Super Admin)
 */
export const getAllSocietyAdmins = async () => {
  return await User.find({ role: "society_admin" })
    .populate("societyId", "name location")
    .select("-password")
    .sort({ createdAt: -1 });
};

/**
 * Deactivate a user (Soft Delete)
 * @param {string} societyId 
 * @param {string} userId 
 * @param {string} requestedByUserId 
 */
export const deactivateUser = async (societyId, userId, requestedByUserId) => {
  const user = await User.findOne({ _id: userId, societyId });
  
  if (!user) {
    const error = new Error("User not found or does not belong to this society.");
    error.status = 404;
    throw error;
  }

  if (userId.toString() === requestedByUserId.toString()) {
    const error = new Error("You cannot deactivate your own account.");
    error.status = 403;
    throw error;
  }

  if (user.role === "society_admin") {
    // Check if this is the last active society admin
    const adminCount = await User.countDocuments({
      societyId,
      role: "society_admin",
      accountStatus: "ACTIVE",
      _id: { $ne: userId }
    });

    if (adminCount === 0) {
      const error = new Error("Cannot deactivate the last active society admin. Assign a new admin first.");
      error.status = 400;
      throw error;
    }
  }

  if (user.role === "service_staff") {
    // Prevent deactivation if they have active work orders
    const activeWorkOrders = await WorkOrder.countDocuments({
      assignedTo: userId,
      status: { $in: ["ASSIGNED", "IN_PROGRESS"] }
    });

    if (activeWorkOrders > 0) {
      const error = new Error(`Cannot deactivate staff. They have ${activeWorkOrders} active work orders. Please reassign them first.`);
      error.status = 400;
      throw error;
    }
  }

  if (user.role === "resident") {
    // End current occupancy
    await Occupancy.updateMany(
      { residentId: userId, status: "ACTIVE" },
      { $set: { status: "PAST", moveOutDate: new Date() } }
    );
  }

  // Soft delete
  user.accountStatus = "INACTIVE";
  user.canLogin = false;
  user.deletedAt = new Date();
  user.deletedBy = requestedByUserId;
  await user.save();

  return { message: "User deactivated successfully", user };
};

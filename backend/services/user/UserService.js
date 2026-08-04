import User from "../../models/User.js";
import Occupancy from "../../models/Occupancy.js";
import WorkOrder from "../../models/WorkOrder.js";

/**
 * Get all users for a society with advanced filtering
 * @param {string} societyId 
 * @param {object} filters
 */
export const getSocietyUsers = async (societyId, filters = {}) => {
  const query = { societyId, role: { $ne: "super_admin" } };
  
  const status = filters.status || "ACTIVE";
  if (status !== "ALL") {
    query.accountStatus = status;
  }

  if (filters.role) {
    const roles = filters.role.split(",").map(r => r.trim());
    if (roles.length > 1) {
      query.role = { $in: roles };
    } else {
      query.role = roles[0];
    }
  }

  if (filters.department) {
    query.serviceCategory = filters.department;
  }

  if (filters.shift) {
    query.shift = filters.shift;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { employeeId: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } }
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
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

/**
 * Create a new user (Staff/Security)
 */
export const createUser = async (societyId, userData) => {
  if (!userData.name || !userData.email || !userData.password || !userData.role) {
    const error = new Error("Name, email, password, and role are required.");
    error.status = 400;
    throw error;
  }
  
  if (userData.password.length < 8) {
    const error = new Error("Password must be at least 8 characters long.");
    error.status = 400;
    throw error;
  }

  if (userData.role === "security" && !userData.shift) {
    const error = new Error("Shift is required for security staff.");
    error.status = 400;
    throw error;
  }

  if (userData.role === "service_staff" && !userData.serviceCategory) {
    const error = new Error("Department/Service Category is required for service staff.");
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error("Email is already in use.");
    error.status = 400;
    throw error;
  }

  if (userData.employeeId && userData.employeeId.trim()) {
    userData.employeeId = userData.employeeId.trim();
    const existingEmp = await User.findOne({ societyId, employeeId: userData.employeeId });
    if (existingEmp) {
      const error = new Error("Employee ID is already in use within this society.");
      error.status = 400;
      throw error;
    }
  } else {
    delete userData.employeeId;
  }

  const user = new User({
    societyId,
    ...userData
  });
  await user.save();
  user.password = undefined; // Don't return password
  return user;
};

/**
 * Update a user
 */
export const updateUser = async (societyId, userId, userData) => {
  if (userData.employeeId) {
    const existingEmp = await User.findOne({ societyId, employeeId: userData.employeeId, _id: { $ne: userId } });
    if (existingEmp) {
      const error = new Error("Employee ID is already in use within this society.");
      error.status = 400;
      throw error;
    }
  }
  
  if (userData.email) {
    const existingEmail = await User.findOne({ email: userData.email, _id: { $ne: userId } });
    if (existingEmail) {
      const error = new Error("Email is already in use.");
      error.status = 400;
      throw error;
    }
  }

  // Prevent password update through this generic route
  if (userData.password) {
    delete userData.password;
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, societyId },
    { $set: userData },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }
  return user;
};

/**
 * Get user by ID
 */
export const getUserById = async (societyId, userId) => {
  const user = await User.findOne({ _id: userId, societyId }).select("-password");
  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }
  return user;
};

/**
 * Toggle user account status (Activate/Deactivate)
 */
export const toggleUserStatus = async (societyId, userId, accountStatus, requestedByUserId) => {
  if (accountStatus === "INACTIVE") {
    // If we are deactivating, reuse the existing deactivate logic for safety checks
    const res = await deactivateUser(societyId, userId, requestedByUserId);
    return res.user;
  }

  // Activate
  const user = await User.findOneAndUpdate(
    { _id: userId, societyId },
    { 
      $set: { 
        accountStatus: "ACTIVE", 
        canLogin: true,
        deletedAt: null,
        deletedBy: null
      } 
    },
    { new: true }
  ).select("-password");

  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }
  
  return user;
};

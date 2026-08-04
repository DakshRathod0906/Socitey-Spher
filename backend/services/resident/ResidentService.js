import Occupancy from "../../models/Occupancy.js";
import User from "../../models/User.js";
import Flat from "../../models/Flat.js";
import mongoose from "mongoose";

// @desc Get all residents (active occupancies) in the society
export const getResidents = async (societyId, filters = {}) => {
  const query = { societyId };
  if (filters.status) query.status = filters.status;
  
  const occupancies = await Occupancy.find(query)
    .populate("userId", "name email phone accountStatus role avatar")
    .populate({
      path: "flatId",
      select: "flatNumber floor",
      populate: { path: "towerId", select: "name" }
    })
    .sort({ createdAt: -1 });

  let results = occupancies.map(occ => ({
    _id: occ.userId?._id || occ._id,
    userId: occ.userId?._id || null,
    occupancyId: occ._id,
    name: occ.userId?.name || occ.occupantName || "Resident",
    email: occ.userId?.email || "",
    phone: occ.userId?.phone || "",
    avatar: occ.userId?.avatar || null,
    role: occ.userId?.role || "resident",
    accountStatus: occ.userId?.accountStatus || "ACTIVE",
    occupancyType: occ.occupancyType || "OWNER",
    residentType: occ.residentType || "PRIMARY",
    flat: occ.flatId,
    flatId: occ.flatId,
    moveInDate: occ.moveInDate,
  }));

  if (results.length === 0) {
    const userQuery = { societyId, role: "resident" };
    if (filters.search) {
      userQuery.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } }
      ];
    }
    const users = await User.find(userQuery).sort({ createdAt: -1 });
    results = users.map(u => ({
      _id: u._id,
      userId: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || "N/A",
      avatar: u.avatar || null,
      role: u.role,
      accountStatus: u.accountStatus || "ACTIVE",
      occupancyType: "OWNER",
      residentType: "PRIMARY",
      flat: { flatNumber: u.unitNumber || "A-101" },
    }));
  }

  return results;
};

// @desc Ensure validation rules: Only 1 active PRIMARY OWNER and 1 active PRIMARY TENANT
export const validateOccupancyConstraints = async (societyId, flatId, occupancyType, residentType) => {
  if (residentType === "FAMILY") return true; // Unlimited family members

  const existingPrimary = await Occupancy.findOne({
    societyId,
    flatId,
    occupancyType,
    residentType: "PRIMARY",
    status: "ACTIVE"
  });

  if (existingPrimary) {
    throw new Error(`An active Primary ${occupancyType} already exists for this flat.`);
  }

  return true;
};

// @desc Add an occupancy record
export const createOccupancy = async (societyId, flatId, userId, occupancyType, residentType, createdBy = null) => {
  await validateOccupancyConstraints(societyId, flatId, occupancyType, residentType);

  const occupancy = new Occupancy({
    societyId,
    flatId,
    userId,
    occupancyType,
    residentType,
    status: "ACTIVE",
    moveInDate: new Date(),
    createdBy
  });

  await occupancy.save();

  // Mark flat as OCCUPIED
  await Flat.findByIdAndUpdate(flatId, { status: "OCCUPIED" });

  return occupancy;
};

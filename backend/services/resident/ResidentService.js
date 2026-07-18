import Occupancy from "../../models/Occupancy.js";
import User from "../../models/User.js";
import Flat from "../../models/Flat.js";
import mongoose from "mongoose";

// @desc Get all residents (active occupancies) in the society
export const getResidents = async (societyId, filters = {}) => {
  const query = { societyId, status: "ACTIVE", ...filters };
  
  const occupancies = await Occupancy.find(query)
    .populate("userId", "name email phone accountStatus role")
    .populate({
      path: "flatId",
      select: "flatNumber floor",
      populate: { path: "towerId", select: "name" }
    })
    .sort({ createdAt: -1 });

  return occupancies.map(occ => ({
    _id: occ.userId?._id, // the user's ID acts as resident ID for API purposes
    occupancyId: occ._id,
    name: occ.userId?.name,
    email: occ.userId?.email,
    phone: occ.userId?.phone,
    role: occ.userId?.role,
    accountStatus: occ.userId?.accountStatus,
    occupancyType: occ.occupancyType,
    residentType: occ.residentType,
    flat: occ.flatId,
    moveInDate: occ.moveInDate,
  }));
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

import User from "../../../models/User.js";
import Occupancy from "../../../models/Occupancy.js";

export const createResident = async (societyId, flatId, overrides = {}) => {
  const resident = await User.create({
    societyId,
    flatId,
    name: "John Resident",
    email: `resident_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`,
    password: "password123",
    role: "resident",
    residentType: "PRIMARY",
    accountStatus: "ACTIVE",
    canLogin: true,
    ...overrides
  });

  if (flatId && societyId) {
    await Occupancy.create({
      societyId,
      flatId,
      userId: resident._id,
      occupancyType: "OWNER",
      residentType: "PRIMARY",
      status: "ACTIVE",
      moveInDate: new Date()
    });
  }

  return resident;
};

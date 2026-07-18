import User from "../../../models/User.js";

export const createResident = async (societyId, flatId, overrides = {}) => {
  return await User.create({
    societyId,
    flatId,
    name: "John Resident",
    email: `resident_${Date.now()}@test.com`,
    password: "password123",
    role: "resident",
    residentType: "PRIMARY",
    accountStatus: "ACTIVE",
    canLogin: true,
    ...overrides
  });
};

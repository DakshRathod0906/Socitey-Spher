import User from "../../../models/User.js";

export const createSecurity = async (societyId, overrides = {}) => {
  return await User.create({
    societyId,
    name: "Sam Security",
    email: `security_${Date.now()}@test.com`,
    password: "password123",
    role: "security",
    accountStatus: "ACTIVE",
    canLogin: true,
    ...overrides
  });
};

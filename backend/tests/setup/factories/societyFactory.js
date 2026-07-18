import mongoose from "mongoose";
import Society from "../../../models/Society.js";
import Tower from "../../../models/Tower.js";
import Flat from "../../../models/Flat.js";

export const createSociety = async (overrides = {}) => {
  const society = await Society.create({
    societyCode: `SOC${Date.now()}`,
    name: "Test Society",
    address: "123 Test St",
    city: "Testville",
    state: "Test State",
    pincode: "123456",
    status: "ACTIVE",
    ...overrides
  });
  return society;
};

export const createTower = async (societyId, overrides = {}) => {
  return await Tower.create({
    societyId,
    name: "Tower A",
    totalFloors: 10,
    ...overrides
  });
};

export const createFlat = async (societyId, towerId, overrides = {}) => {
  return await Flat.create({
    societyId,
    towerId,
    flatNumber: "101",
    floor: 1,
    type: "2BHK",
    ...overrides
  });
};

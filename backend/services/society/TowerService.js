import Tower from "../../models/Tower.js";
import Society from "../../models/Society.js";
import Flat from "../../models/Flat.js";

export const createTower = async (societyId, data) => {
  const { name, totalFloors } = data;
  if (!name || !totalFloors) {
    throw new Error("Tower name and total floors are required");
  }

  const existingTower = await Tower.findOne({ societyId, name });
  if (existingTower) {
    throw new Error("A tower with this name already exists");
  }

  const tower = await Tower.create({ societyId, name, totalFloors });

  // Update society total towers
  await Society.findByIdAndUpdate(societyId, { $inc: { totalTowers: 1 } });

  return tower;
};

export const editTower = async (societyId, towerId, data) => {
  const { name, totalFloors } = data;
  
  const tower = await Tower.findOne({ _id: towerId, societyId });
  if (!tower) {
    throw new Error("Tower not found");
  }

  if (name && name !== tower.name) {
    const existingTower = await Tower.findOne({ societyId, name });
    if (existingTower) {
      throw new Error("A tower with this name already exists");
    }
    tower.name = name;
  }

  if (totalFloors) {
    // If we want to prevent reducing floors if flats exist, we could check here.
    // Keeping it simple for now.
    tower.totalFloors = totalFloors;
  }

  await tower.save();
  return tower;
};

export const deleteTower = async (societyId, towerId) => {
  const tower = await Tower.findOne({ _id: towerId, societyId });
  if (!tower) {
    throw new Error("Tower not found");
  }

  // Prevent deleting if flats exist
  const flatsCount = await Flat.countDocuments({ towerId });
  if (flatsCount > 0) {
    throw new Error("Cannot delete tower with existing flats. Delete flats first.");
  }

  await Tower.findByIdAndDelete(towerId);
  await Society.findByIdAndUpdate(societyId, { $inc: { totalTowers: -1 } });
  
  return { message: "Tower deleted successfully" };
};

export const getTowers = async (societyId) => {
  return await Tower.find({ societyId }).sort({ createdAt: 1 });
};

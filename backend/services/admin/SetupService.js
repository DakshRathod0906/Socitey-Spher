import mongoose from "mongoose";
import Society from "../../models/Society.js";
import Tower from "../../models/Tower.js";
import Flat from "../../models/Flat.js";
import eventBus from "../../events/eventBus.js";
import { EVENTS } from "../../events/events.js";
import { generateFlatNumbers } from "../../utils/generateFlatNumbers.js";

// Ordered dependencies for setup wizard
export const STEP_DEPENDENCIES = {
  societyProfile: [],
  towers: ["societyProfile"],
  flats: ["towers"],
  amenities: ["flats"],
  staff: ["amenities"]
};

const getSociety = async (societyId) => {
  const society = await Society.findById(societyId);
  if (!society) {
    const error = new Error("Society not found");
    error.status = 404;
    throw error;
  }
  return society;
};

export const validateStep = async (societyId, stepName) => {
  const society = await getSociety(societyId);
  
  const dependencies = STEP_DEPENDENCIES[stepName];
  if (!dependencies) {
    const error = new Error(`Invalid setup step: ${stepName}`);
    error.status = 400;
    throw error;
  }

  for (const dep of dependencies) {
    if (!society.setupProgress[dep]) {
      const error = new Error(`Cannot complete '${stepName}' before '${dep}' is completed.`);
      error.status = 400;
      throw error;
    }
  }

  return society;
};

export const markStepCompleted = async (societyId, stepName) => {
  const society = await validateStep(societyId, stepName);
  society.setupProgress[stepName] = true;
  await society.save();
  return society;
};

export const checkCompletion = async (societyId) => {
  const society = await getSociety(societyId);
  
  const isCompleted = Object.keys(STEP_DEPENDENCIES).every(
    (step) => society.setupProgress[step]
  );

  if (isCompleted && !society.setupProgress.completed) {
    society.setupProgress.completed = true;
    await society.save();
  }

  return society;
};

export const updateProfile = async (societyId, profileData) => {
  await validateStep(societyId, "societyProfile");
  
  const society = await Society.findByIdAndUpdate(
    societyId,
    { $set: profileData },
    { new: true, runValidators: true }
  );
  
  return markStepCompleted(societyId, "societyProfile");
};

export const saveTowers = async (societyId, towersData) => {
  await validateStep(societyId, "towers");

  // Upsert each tower to support idempotency and updates
  const towerOps = towersData.map((tower, index) => ({
    updateOne: {
      filter: { societyId, name: tower.name },
      update: {
        $set: {
          floorsCount: tower.floorsCount,
          flatsPerFloor: tower.flatsPerFloor,
          sortOrder: index,
          isActive: true
        }
      },
      upsert: true
    }
  }));

  if (towerOps.length > 0) {
    await Tower.bulkWrite(towerOps);
  }

  // NOTE: If a tower is removed from the payload, we might want to mark it inactive or delete it.
  // For simplicity, we just upsert the ones provided. If strict synchronization is needed,
  // we would fetch existing, compare, and delete/deactivate omitted ones.

  return markStepCompleted(societyId, "towers");
};

export const generateFlats = async (societyId) => {
  await validateStep(societyId, "flats");
  
  const towers = await Tower.find({ societyId, isActive: true });
  if (!towers || towers.length === 0) {
    const error = new Error("No towers found for society");
    error.status = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const allFlats = [];

    for (const tower of towers) {
      const generated = generateFlatNumbers(tower.name, tower.floorsCount, tower.flatsPerFloor);
      for (const flat of generated) {
        allFlats.push({
          societyId,
          towerId: tower._id,
          flatNumber: flat.flatNumber,
          floor: flat.floor,
          status: "VACANT",
          isGenerated: true,
          // type and maintenanceAmount can use schema defaults
        });
      }
    }

    // 1. Delete all automatically generated flats for this society to ensure idempotency.
    // If a flat was manually modified (e.g. status changed), we might want to preserve it,
    // but bulk generation usually resets the inventory if called again during setup.
    await Flat.deleteMany({ societyId, isGenerated: true }).session(session);

    // 2. Bulk insert the new flats
    if (allFlats.length > 0) {
      await Flat.insertMany(allFlats, { session });
    }

    // 3. Mark step complete
    const society = await Society.findById(societyId).session(session);
    society.setupProgress["flats"] = true;
    await society.save({ session });

    await session.commitTransaction();
    session.endSession();

    return society;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const saveAmenities = async (societyId, amenitiesData) => {
  await validateStep(societyId, "amenities");
  // Assuming society model or a separate amenities collection will handle this.
  // We will just mark it complete for now until amenities logic is fully defined.
  return markStepCompleted(societyId, "amenities");
};

export const saveStaff = async (societyId, staffData) => {
  await validateStep(societyId, "staff");
  // Implement staff invitations logic here.
  return markStepCompleted(societyId, "staff");
};

export const activateSociety = async (societyId) => {
  const society = await checkCompletion(societyId);

  if (!society.setupProgress.completed) {
    const error = new Error("Cannot activate society: Setup wizard not completed");
    error.status = 400;
    throw error;
  }

  if (society.status !== "APPROVED") {
    const error = new Error(`Cannot activate society from status: ${society.status}`);
    error.status = 400;
    throw error;
  }

  society.status = "ACTIVE";
  await society.save();

  eventBus.emit(EVENTS.SOCIETY_ACTIVATED, { society });

  return society;
};

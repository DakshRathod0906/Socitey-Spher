import ParkingSlot from "../../models/ParkingSlot.js";

/**
 * Create a new physical parking slot
 */
export const createSlot = async ({ societyId, slotNumber, slotType }) => {
  const existing = await ParkingSlot.findOne({ societyId, slotNumber });
  if (existing) {
    throw new Error(`Parking slot ${slotNumber} already exists.`);
  }

  const slot = new ParkingSlot({
    societyId,
    slotNumber,
    slotType: slotType || "resident",
    status: "AVAILABLE",
  });

  return await slot.save();
};

/**
 * Allocate slot to a resident user & vehicle
 */
export const allocateSlot = async (slotId, userId, vehicleId, societyId) => {
  const slot = await ParkingSlot.findOne({ _id: slotId, societyId });
  if (!slot) throw new Error("Parking slot not found");

  slot.allocatedTo = userId;
  slot.vehicleId = vehicleId || null;
  slot.status = "ALLOCATED";

  return await slot.save();
};

/**
 * Unassign (release) a parking slot
 */
export const unassignSlot = async (slotId, societyId) => {
  const slot = await ParkingSlot.findOne({ _id: slotId, societyId });
  if (!slot) throw new Error("Parking slot not found");

  slot.allocatedTo = null;
  slot.vehicleId = null;
  slot.status = "AVAILABLE";
  slot.isOccupied = false;

  return await slot.save();
};

/**
 * Delete a physical parking slot
 */
export const deleteSlot = async (slotId, societyId) => {
  const slot = await ParkingSlot.findOneAndDelete({ _id: slotId, societyId });
  if (!slot) throw new Error("Parking slot not found");

  return { success: true, message: "Parking slot deleted successfully" };
};

/**
 * Update real-time physical occupancy
 */
export const updateOccupancy = async (slotId, isOccupied, societyId) => {
  const slot = await ParkingSlot.findOne({ _id: slotId, societyId });
  if (!slot) throw new Error("Parking slot not found");

  slot.isOccupied = isOccupied;
  slot.occupiedAt = isOccupied ? new Date() : null;

  return await slot.save();
};

/**
 * List parking slots
 */
export const listSlots = async (societyId, filters = {}) => {
  return await ParkingSlot.find({ societyId, ...filters })
    .populate("allocatedTo", "name email phone")
    .populate("vehicleId", "licensePlate makeModel")
    .sort({ slotNumber: 1 });
};

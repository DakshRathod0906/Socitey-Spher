import ParkingSlot from "../../models/ParkingSlot.js";
import Vehicle from "../../models/Vehicle.js";

/**
 * Creates a new parking slot (Admin only)
 */
export const createSlot = async (data, societyId) => {
  const existing = await ParkingSlot.findOne({ societyId, slotNumber: data.slotNumber });
  if (existing) {
    throw new Error(`Slot number ${data.slotNumber} already exists`);
  }

  const slot = new ParkingSlot({
    societyId,
    slotNumber: data.slotNumber,
    slotType: data.slotType || "resident",
    status: "AVAILABLE",
    isOccupied: false
  });

  return await slot.save();
};

/**
 * Allocate a slot to a user and vehicle
 */
export const allocateSlot = async (slotId, userId, vehicleId, societyId) => {
  const slot = await ParkingSlot.findOne({ _id: slotId, societyId });
  if (!slot) throw new Error("Parking slot not found");
  if (slot.status !== "AVAILABLE") throw new Error(`Cannot allocate slot. Status is ${slot.status}`);

  if (vehicleId) {
    // Check if vehicle exists
    const vehicle = await Vehicle.findOne({ _id: vehicleId, societyId });
    if (!vehicle) throw new Error("Vehicle not found");

    // Prevent double allocation for vehicle
    const existingAllocation = await ParkingSlot.findOne({ societyId, vehicleId });
    if (existingAllocation && existingAllocation._id.toString() !== slotId.toString()) {
      throw new Error(`Vehicle ${vehicle.licensePlate} is already allocated to slot ${existingAllocation.slotNumber}`);
    }
  }

  slot.allocatedTo = userId;
  slot.vehicleId = vehicleId || null;
  slot.status = "ALLOCATED";
  
  return await slot.save();
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
    .populate("allocatedTo", "name flatId")
    .populate("vehicleId", "licensePlate makeModel")
    .sort({ slotNumber: 1 });
};

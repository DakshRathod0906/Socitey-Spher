import Vehicle from "../../models/Vehicle.js";

/**
 * Normalizes a license plate by removing spaces, dashes, and converting to uppercase
 */
const normalizePlate = (plate) => {
  return plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

/**
 * Register a new vehicle
 */
export const registerVehicle = async (data, societyId, userId) => {
  const normalizedPlate = normalizePlate(data.licensePlate);

  // Check if vehicle already exists in this society
  const existing = await Vehicle.findOne({ societyId, normalizedLicensePlate: normalizedPlate });
  if (existing) {
    throw new Error(`Vehicle with license plate ${data.licensePlate} is already registered in this society`);
  }

  const vehicle = new Vehicle({
    societyId,
    ownerUserId: data.ownerUserId || userId, // Admin can set owner, resident sets self
    type: data.type,
    licensePlate: data.licensePlate,
    normalizedLicensePlate: normalizedPlate,
    makeModel: data.makeModel,
    color: data.color,
    status: "ACTIVE",
    createdBy: userId
  });

  return await vehicle.save();
};

/**
 * List vehicles in a society
 */
export const listVehicles = async (societyId, filters = {}) => {
  return await Vehicle.find({ societyId, ...filters })
    .populate("ownerUserId", "name email flatId")
    .sort({ createdAt: -1 });
};

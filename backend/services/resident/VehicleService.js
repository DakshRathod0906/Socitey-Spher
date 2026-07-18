import Vehicle from "../../models/Vehicle.js";

const normalizePlate = (plate) => plate.replace(/\s+/g, "").toUpperCase();

export const addVehicle = async (societyId, ownerUserId, data) => {
  const { type, licensePlate, makeModel, color } = data;
  if (!type || !licensePlate) {
    throw new Error("Type and license plate are required");
  }

  // Tenant Isolation: Ensure owner belongs to this society
  const User = (await import("../../models/User.js")).default;
  const owner = await User.findOne({ _id: ownerUserId, societyId });
  if (!owner) {
    throw new Error("Owner not found in this society");
  }

  const normalizedLicensePlate = normalizePlate(licensePlate);

  const existing = await Vehicle.findOne({ societyId, normalizedLicensePlate });
  if (existing) {
    throw new Error("This vehicle is already registered in the society.");
  }

  const vehicle = await Vehicle.create({
    societyId,
    ownerUserId,
    type,
    licensePlate,
    normalizedLicensePlate,
    makeModel,
    color,
    status: "ACTIVE"
  });

  return vehicle;
};

export const getVehiclesByUser = async (societyId, ownerUserId) => {
  return await Vehicle.find({ societyId, ownerUserId, status: "ACTIVE" });
};

export const updateVehicleStatus = async (societyId, vehicleId, status) => {
  const validStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: vehicleId, societyId },
    { status },
    { new: true }
  );

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  return vehicle;
};

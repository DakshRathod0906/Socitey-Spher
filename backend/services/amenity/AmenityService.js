import Amenity from "../../models/Amenity.js";
import Booking from "../../models/Booking.js";

const validateAmenityData = (data) => {
  if (!data.name || data.name.trim() === "") {
    const error = new Error("Amenity name is required");
    error.status = 400;
    throw error;
  }
  if (data.capacity !== undefined && data.capacity <= 0) {
    const error = new Error("Capacity must be greater than 0");
    error.status = 400;
    throw error;
  }
  if (data.slotDurationMinutes !== undefined && data.slotDurationMinutes <= 0) {
    const error = new Error("Booking duration must be greater than 0");
    error.status = 400;
    throw error;
  }
  if (data.openTime && data.closeTime) {
    if (data.openTime >= data.closeTime) {
      const error = new Error("Opening time must be before closing time");
      error.status = 400;
      throw error;
    }
  }
};

/**
 * Creates a new amenity (Admin only)
 */
export const createAmenity = async (data, societyId) => {
  validateAmenityData(data);
  const amenity = new Amenity({
    societyId,
    ...data
  });
  return await amenity.save();
};

/**
 * Lists all amenities for a society
 */
export const listAmenities = async (societyId, includeInactive = false) => {
  const filter = { societyId };
  if (!includeInactive) filter.isActive = true;
  return await Amenity.find(filter).sort({ name: 1 });
};

/**
 * Updates an amenity (Admin only)
 */
export const updateAmenity = async (amenityId, data, societyId) => {
  validateAmenityData(data);
  const amenity = await Amenity.findOneAndUpdate(
    { _id: amenityId, societyId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!amenity) throw new Error("Amenity not found");
  return amenity;
};

/**
 * Deletes an amenity (Soft Delete)
 */
export const deleteAmenity = async (amenityId, societyId) => {
  const amenity = await Amenity.findOne({ _id: amenityId, societyId });
  if (!amenity) {
    const error = new Error("Amenity not found");
    error.status = 404;
    throw error;
  }

  // Always soft delete
  amenity.isActive = false;
  await amenity.save();
  return { message: "Amenity successfully deleted (deactivated)", amenity };
};

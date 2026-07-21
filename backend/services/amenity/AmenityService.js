import Amenity from "../../models/Amenity.js";

/**
 * Creates a new amenity (Admin only)
 */
export const createAmenity = async (data, societyId) => {
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
  const amenity = await Amenity.findOneAndUpdate(
    { _id: amenityId, societyId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!amenity) throw new Error("Amenity not found");
  return amenity;
};

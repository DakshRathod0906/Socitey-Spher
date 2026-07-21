import Booking from "../../models/Booking.js";
import Amenity from "../../models/Amenity.js";

/**
 * Helper to convert HH:MM to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Creates an amenity booking
 */
export const createBooking = async ({ societyId, residentId, amenityId, bookingDate, startTime, endTime }) => {
  // 1. Validate amenity
  const amenity = await Amenity.findOne({ _id: amenityId, societyId });
  if (!amenity) throw new Error("Amenity not found");
  if (!amenity.isActive) throw new Error("This amenity is currently not active for booking");

  // 2. Validate time limits
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const openMins = timeToMinutes(amenity.openTime);
  const closeMins = timeToMinutes(amenity.closeTime);

  if (startMins >= endMins) throw new Error("Start time must be before end time");
  if (startMins < openMins || endMins > closeMins) {
    throw new Error(`Booking must be within operating hours (${amenity.openTime} - ${amenity.closeTime})`);
  }

  // 3. Optional: Validate slot duration multiples
  const duration = endMins - startMins;
  if (duration < amenity.slotDurationMinutes) {
    throw new Error(`Minimum booking duration is ${amenity.slotDurationMinutes} minutes`);
  }

  // 4. Overlap & Capacity check
  // We need to fetch existing CONFIRMED bookings for that date
  const existingBookings = await Booking.find({
    amenityId,
    bookingDate,
    status: "CONFIRMED"
  });

  let overlapCount = 0;
  for (const b of existingBookings) {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);

    // Overlap condition: existing.startTime < requested.endTime AND existing.endTime > requested.startTime
    if (bStart < endMins && bEnd > startMins) {
      overlapCount++;
    }
  }

  if (overlapCount >= amenity.capacity) {
    throw new Error(`Amenity is fully booked for this time slot (Capacity: ${amenity.capacity})`);
  }

  // 5. Create booking
  const booking = new Booking({
    societyId,
    amenityId,
    residentId,
    bookingDate,
    startTime,
    endTime,
    status: "CONFIRMED"
  });

  return await booking.save();
};

/**
 * List bookings
 */
export const listBookings = async (societyId, filters = {}) => {
  return await Booking.find({ societyId, ...filters })
    .populate("amenityId", "name")
    .populate("residentId", "name email")
    .sort({ bookingDate: -1, startTime: 1 });
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId, userId, role) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  if (role !== "super_admin" && role !== "society_admin" && booking.residentId.toString() !== userId.toString()) {
    throw new Error("Not authorized to cancel this booking");
  }

  if (booking.status === "CANCELLED") throw new Error("Booking is already cancelled");
  
  booking.status = "CANCELLED";
  return await booking.save();
};

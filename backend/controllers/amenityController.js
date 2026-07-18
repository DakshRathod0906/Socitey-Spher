import Amenity from "../models/Amenity.js";
import Booking from "../models/Booking.js";

// @desc   Add an amenity (admin config)
// @route  POST /api/amenities
export const createAmenity = async (req, res, next) => {
  try {
    const { name, description, capacity, openTime, closeTime, slotDurationMinutes } = req.body;
    if (!name) {
      res.status(400);
      throw new Error("Amenity name is required");
    }

    const amenity = await Amenity.create({
      societyId: req.societyId,
      name,
      description,
      capacity,
      openTime,
      closeTime,
      slotDurationMinutes,
    });

    res.status(201).json(amenity);
  } catch (err) {
    next(err);
  }
};

// @desc   List amenities
// @route  GET /api/amenities
export const listAmenities = async (req, res, next) => {
  try {
    const amenities = await Amenity.find({ societyId: req.societyId, isActive: true });
    res.json(amenities);
  } catch (err) {
    next(err);
  }
};

// @desc   Book an amenity slot
// @route  POST /api/amenities/bookings
export const createBooking = async (req, res, next) => {
  try {
    const { amenityId, bookingDate, startTime, endTime } = req.body;
    if (!amenityId || !bookingDate || !startTime || !endTime) {
      res.status(400);
      throw new Error("Amenity, date, start time, and end time are required");
    }

    const existing = await Booking.findOne({
      amenityId,
      bookingDate,
      startTime,
      status: "confirmed",
    });
    if (existing) {
      res.status(400);
      throw new Error("This slot is already booked");
    }

    const booking = await Booking.create({
      societyId: req.societyId,
      amenityId,
      residentId: req.user._id,
      bookingDate,
      startTime,
      endTime,
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// @desc   List bookings (own for resident, all for admin)
// @route  GET /api/amenities/bookings
export const listBookings = async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "resident") filter.residentId = req.user._id;

    const bookings = await Booking.find(filter)
      .populate("amenityId", "name")
      .populate("residentId", "name")
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// @desc   Cancel a booking
// @route  PUT /api/amenities/bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id, societyId: req.societyId };
    if (req.user.role === "resident") filter.residentId = req.user._id;

    const booking = await Booking.findOneAndUpdate(filter, { status: "cancelled" }, { new: true });
    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

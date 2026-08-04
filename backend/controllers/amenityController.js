import * as AmenityService from "../services/amenity/AmenityService.js";
import * as BookingService from "../services/amenity/BookingService.js";

export const createAmenity = async (req, res) => {
  try {
    const amenity = await AmenityService.createAmenity(req.body, req.societyId);
    res.status(201).json({
      success: true,
      message: "Amenity created successfully",
      data: amenity
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const listAmenities = async (req, res) => {
  try {
    // Admins can see inactive amenities
    const includeInactive = req.user.role === "society_admin" || req.user.role === "super_admin";
    const amenities = await AmenityService.listAmenities(req.societyId, includeInactive);
    res.json({
      success: true,
      message: "Amenities fetched successfully",
      data: amenities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAmenity = async (req, res) => {
  try {
    const amenity = await AmenityService.updateAmenity(req.params.id, req.body, req.societyId);
    res.json({
      success: true,
      message: "Amenity updated successfully",
      data: amenity
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAmenity = async (req, res) => {
  try {
    const result = await AmenityService.deleteAmenity(req.params.id, req.societyId);
    res.json({
      success: true,
      message: result.message,
      data: result.amenity
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const booking = await BookingService.createBooking({
      ...req.body,
      residentId: req.body.residentId || req.user._id,
      societyId: req.societyId
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listBookings = async (req, res) => {
  try {
    const filters = {};
    if (req.query.amenityId) filters.amenityId = req.query.amenityId;
    if (req.user.role === "resident") filters.residentId = req.user._id;

    const bookings = await BookingService.listBookings(req.societyId, filters);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await BookingService.cancelBooking(req.params.id, req.user._id, req.user.role);
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

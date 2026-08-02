import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import {
  createAmenity,
  listAmenities,
  updateAmenity,
  createBooking,
  listBookings,
  cancelBooking,
  deleteAmenity
} from "../controllers/amenityController.js";

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

// Amenities
router.post("/", authorize("society_admin"), createAmenity);
router.get("/", listAmenities);
router.put("/:id", authorize("society_admin"), updateAmenity);
router.delete("/:id", authorize("society_admin"), deleteAmenity);

// Bookings
router.post("/bookings", createBooking);
router.get("/bookings", listBookings);
router.put("/bookings/:id/cancel", cancelBooking);

export default router;

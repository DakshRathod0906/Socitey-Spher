import express from "express";
import {
  createAmenity,
  listAmenities,
  createBooking,
  listBookings,
  cancelBooking,
} from "../controllers/amenityController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.post("/", protect, authorize("society_admin"), enforceTenant, createAmenity);
router.get("/", protect, enforceTenant, listAmenities);
router.post("/bookings", protect, authorize("resident"), enforceTenant, createBooking);
router.get("/bookings", protect, enforceTenant, listBookings);
router.put("/bookings/:id/cancel", protect, enforceTenant, cancelBooking);

export default router;

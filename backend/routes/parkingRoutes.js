import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import {
  registerVehicle,
  listVehicles,
  createSlot,
  allocateSlot,
  updateOccupancy,
  listSlots
} from "../controllers/parkingController.js";

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

// Vehicles
router.post("/vehicles", registerVehicle);
router.get("/vehicles", listVehicles);

// Parking Slots
router.post("/slots", authorize("society_admin"), createSlot);
router.get("/slots", listSlots);
router.post("/slots/:id/allocate", authorize("society_admin"), allocateSlot);
router.put("/slots/:id/occupancy", authorize("security_guard", "society_admin"), updateOccupancy);

export default router;

import express from "express";
import {
  registerVehicle,
  listVehicles,
  createSlot,
  listSlots,
  allocateSlot,
  releaseSlot,
} from "../controllers/parkingController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.post("/vehicles", protect, authorize("resident"), enforceTenant, registerVehicle);
router.get("/vehicles", protect, enforceTenant, listVehicles);

router.post("/slots", protect, authorize("society_admin"), enforceTenant, createSlot);
router.get("/slots", protect, enforceTenant, listSlots);
router.put("/slots/:id/allocate", protect, authorize("society_admin", "security"), enforceTenant, allocateSlot);
router.put("/slots/:id/release", protect, authorize("society_admin", "security"), enforceTenant, releaseSlot);

export default router;

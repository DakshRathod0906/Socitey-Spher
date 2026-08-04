import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as parkingController from "../controllers/parkingController.js";
import * as vehicleController from "../controllers/vehicleController.js";

const router = express.Router();

router.use(protect);

// Vehicle routes
router.post("/vehicles", authorize("resident", "society_admin"), vehicleController.registerVehicle);
router.get("/vehicles", authorize("resident", "society_admin", "security"), vehicleController.listVehicles);

// Parking slot routes
router.post("/slots", authorize("society_admin"), parkingController.createSlot);
router.get("/slots", parkingController.listSlots);
router.post("/slots/:id/allocate", authorize("society_admin"), parkingController.allocateSlot);
router.post("/slots/:id/unassign", authorize("society_admin"), parkingController.unassignSlot);
router.delete("/slots/:id", authorize("society_admin"), parkingController.deleteSlot);
router.put("/slots/:id/occupancy", authorize("security", "society_admin"), parkingController.updateOccupancy);

export default router;

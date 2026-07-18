import express from "express";
import { protect } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import {
  addVehicle,
  getVehicles,
  updateVehicleStatus,
} from "../controllers/vehicleController.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

router.route("/")
  .post(addVehicle)
  .get(getVehicles);

router.get("/:userId", getVehicles);

// Updates to status should only be allowed if resident owns it or admin
router.patch("/:id/status", updateVehicleStatus);

export default router;

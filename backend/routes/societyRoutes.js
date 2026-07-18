import express from "express";
import {
  getMySociety,
  updateMySociety,
  listStaff,
  completeSetup,
  listPendingSocieties,
  getSocietyById,
  approveSociety,
  rejectSociety,
  suspendSociety,
  reactivateSociety,
  createSociety,
  getPendingSociety,
  updatePendingSociety
} from "../controllers/societyController.js";
import {
  addTower,
  editTower,
  deleteTower,
  listTowers
} from "../controllers/towerController.js";
import {
  addFlat,
  autoGenerateFlats,
  listFlats
} from "../controllers/flatController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

// Super Admin platform routes
router.get("/pending", protect, authorize("super_admin"), listPendingSocieties);
// --- Society Admin society management ---
router.post("/", protect, authorize("society_admin"), createSociety);
router.get("/pending-application", protect, authorize("society_admin"), getPendingSociety);
router.put("/pending-application", protect, authorize("society_admin"), updatePendingSociety);
// Society Admin routes (Society Setup Wizard - F-003)
router.get("/me", protect, enforceTenant, getMySociety);
router.put("/me", protect, authorize("society_admin"), enforceTenant, updateMySociety);
router.put("/complete-setup", protect, authorize("society_admin"), enforceTenant, completeSetup);

router.post("/towers", protect, authorize("society_admin"), enforceTenant, addTower);
router.get("/towers", protect, enforceTenant, listTowers);
router.put("/towers/:id", protect, authorize("society_admin"), enforceTenant, editTower);
router.delete("/towers/:id", protect, authorize("society_admin"), enforceTenant, deleteTower);

router.post("/flats", protect, authorize("society_admin"), enforceTenant, addFlat);
router.get("/flats", protect, enforceTenant, listFlats);
router.post("/towers/:towerId/flats/auto-generate", protect, authorize("society_admin"), enforceTenant, autoGenerateFlats);

router.get("/staff", protect, authorize("society_admin"), enforceTenant, listStaff);

// Super Admin dynamic routes (must be at the bottom)
router.get("/:id", protect, authorize("super_admin"), getSocietyById);
router.patch("/:id/approve", protect, authorize("super_admin"), approveSociety);
router.patch("/:id/reject", protect, authorize("super_admin"), rejectSociety);
router.patch("/:id/suspend", protect, authorize("super_admin"), suspendSociety);
router.patch("/:id/reactivate", protect, authorize("super_admin"), reactivateSociety);

export default router;

import express from "express";
import {
  getStatus,
  updateProfile,
  getTowers,
  saveTowers,
  getFlats,
  generateFlats,
  saveAmenities,
  saveStaff,
  completeSetup
} from "../controllers/setupController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Apply middleware to all setup routes
router.use(protect);
router.use(authorize("society_admin", "super_admin"));

router.get("/status", getStatus);

router.put("/profile", updateProfile);

router.route("/towers")
  .get(getTowers)
  .post(saveTowers);

router.route("/flats")
  .get(getFlats)
  .post(generateFlats);

router.post("/amenities", saveAmenities);
router.post("/staff", saveStaff);
router.post("/complete", completeSetup);

export default router;

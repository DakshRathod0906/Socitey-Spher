import express from "express";
import { getPlatformSettings, updatePlatformSettings } from "../controllers/settingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/platform", getPlatformSettings);
router.put("/platform", protect, authorize("super_admin"), updatePlatformSettings);

export default router;

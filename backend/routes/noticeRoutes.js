import express from "express";
import { createNotice, listNotices, archiveNotice, unarchiveNotice, updateNotice, deleteNotice } from "../controllers/noticeController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.post("/", protect, authorize("society_admin"), enforceTenant, createNotice);
router.get("/", protect, enforceTenant, listNotices);
router.put("/:id", protect, authorize("society_admin"), enforceTenant, updateNotice);
router.delete("/:id", protect, authorize("society_admin"), enforceTenant, deleteNotice);
router.put("/:id/archive", protect, authorize("society_admin"), enforceTenant, archiveNotice);
router.put("/:id/unarchive", protect, authorize("society_admin"), enforceTenant, unarchiveNotice);

export default router;

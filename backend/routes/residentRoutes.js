import express from "express";
import { inviteResident, getInvitations, revokeInvitation, getResidents } from "../controllers/residentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.use(protect);
router.use(enforceTenant);

router.post("/invite", authorize("society_admin"), inviteResident);
router.get("/invitations", authorize("society_admin"), getInvitations);
router.patch("/invitations/:id/revoke", authorize("society_admin"), revokeInvitation);

router.get("/", authorize("society_admin", "resident"), getResidents);

export default router;

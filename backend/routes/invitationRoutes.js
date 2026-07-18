import express from "express";
import { protect } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import { authorize } from "../middleware/auth.js";
import {
  createInvitation,
  getInvitations,
  resendInvitation,
  cancelInvitation,
  validateToken,
  acceptInvitation,
} from "../controllers/invitationController.js";

const router = express.Router();

// Public routes for accepting invitations
router.get("/validate/:token", validateToken);
router.post("/accept", acceptInvitation);

// Protected routes
router.use(protect);
router.use(enforceTenant); // requires societyId

// Society Admin routes
router.use(authorize("society_admin"));

router.route("/")
  .post(createInvitation)
  .get(getInvitations);

router.post("/:id/resend", resendInvitation);
router.post("/:id/cancel", cancelInvitation);

export default router;

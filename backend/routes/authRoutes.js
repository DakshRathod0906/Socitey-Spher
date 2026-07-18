import express from "express";
import { registerAdmin, verifyEmail, login, refreshToken, getMe, createUser, acceptInvitation } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);
router.post("/accept-invitation", acceptInvitation);
router.post("/create-user", protect, authorize("society_admin"), enforceTenant, createUser);

export default router;

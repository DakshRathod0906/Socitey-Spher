import express from "express";
import { registerAdmin, verifyEmail, login, refreshToken, getMe, createUser, acceptInvitation, updateProfile, changePassword, forgotPassword, resetPassword, resendVerification } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/accept-invitation", acceptInvitation);
router.post("/create-user", protect, authorize("society_admin"), enforceTenant, createUser);

export default router;

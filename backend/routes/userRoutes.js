import express from "express";
import { deleteUser, getUsers, getSocietyAdmins, createUser, updateUser, getUserById, toggleUserStatus } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.use(protect);

// Super Admin route (must be before enforceTenant)
router.get("/admins", authorize("super_admin"), getSocietyAdmins);

router.use(enforceTenant);

router.get("/", authorize("society_admin"), getUsers);
router.post("/", authorize("society_admin"), createUser);
router.get("/:id", authorize("society_admin"), getUserById);
router.put("/:id", authorize("society_admin"), updateUser);
router.put("/:id/status", authorize("society_admin"), toggleUserStatus);
router.delete("/:id", authorize("society_admin"), deleteUser);

export default router;

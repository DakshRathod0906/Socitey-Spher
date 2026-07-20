import express from "express";
import { deleteUser, getUsers, getSocietyAdmins } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

const router = express.Router();

router.use(protect);

// Super Admin route (must be before enforceTenant)
router.get("/admins", authorize("super_admin"), getSocietyAdmins);

router.use(enforceTenant);

router.get("/", authorize("society_admin"), getUsers);
router.delete("/:id", authorize("society_admin"), deleteUser);

export default router;

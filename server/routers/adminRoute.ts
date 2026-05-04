import express from "express";
import adminController from "../controllers/AdminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRoles from "../middleware/requireRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.get(
  "/users",
  authMiddleware,
  requireRoles(ROLES.ADMIN),
  adminController.getUsers,
);

router.get(
  "/materials",
  authMiddleware,
  requireRoles(ROLES.ADMIN),
  adminController.getMaterials,
);

router.delete(
  "/materials/:id",
  authMiddleware,
  requireRoles(ROLES.ADMIN),
  adminController.deleteMaterial,
);

router.patch(
  "/users/:id/role",
  authMiddleware,
  requireRoles(ROLES.ADMIN, ROLES.MANAGER),
  adminController.updateUserRole,
);

export default router;
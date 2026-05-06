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
  requireRoles(ROLES.ADMIN),
  adminController.updateUserRole,
);

router.get(
  "/role-requests",
  authMiddleware,
  requireRoles(ROLES.MANAGER, ROLES.ADMIN),
  adminController.getRoleRequests,
);

router.patch(
  "/role-requests/:id/approve",
  authMiddleware,
  requireRoles(ROLES.MANAGER, ROLES.ADMIN),
  adminController.approveRoleRequest,
);

router.patch(
  "/role-requests/:id/reject",
  authMiddleware,
  requireRoles(ROLES.MANAGER, ROLES.ADMIN),
  adminController.rejectRoleRequest,
);

router.get(
  "/analytics/overview",
  authMiddleware,
  requireRoles(ROLES.MANAGER, ROLES.ADMIN),
  adminController.getAnalyticsOverview,
);

export default router;
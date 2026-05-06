import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleRequestController from "../controllers/RoleRequestController.js";

const router = express.Router();

router.post("/", authMiddleware, roleRequestController.createRoleRequest);
router.get("/me", authMiddleware, roleRequestController.getMyRoleRequest);
router.patch("/:id/cancel", authMiddleware, roleRequestController.cancelMyRoleRequest);

export default router;

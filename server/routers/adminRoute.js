import express from 'express';
import adminController from '../controllers/AdminController.js';
import checkAdmin from '../middleware/checkAdmin.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/users", authMiddleware, checkAdmin, adminController.getUsers);

router.get("/materials", authMiddleware, checkAdmin, adminController.getMaterials);

router.delete("/materials/:id", authMiddleware, checkAdmin, adminController.deleteMaterial);

export default router;
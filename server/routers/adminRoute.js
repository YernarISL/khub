const Router = require('express');
const router = new Router();
const adminController = require('../controllers/AdminController');
const checkAdmin = require('../middleware/checkAdmin');
const authMiddleware = require('../middleware/authMiddleware'); 

router.get("/users", authMiddleware, checkAdmin, adminController.getUsers);

router.get("/materials", authMiddleware, checkAdmin, adminController.getMaterials);

router.delete("/materials/:id", authMiddleware, checkAdmin, adminController.deleteMaterial);

module.exports = router;
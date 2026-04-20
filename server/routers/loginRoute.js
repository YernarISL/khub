import express from 'express';
import loginController from '../controllers/LoginController.js';

const router = express.Router();

router.post('/', loginController.login);

export default router;
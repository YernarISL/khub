import express from 'express';
import registrationController from '../controllers/RegistrationController.js';

const router = express.Router();


router.post('/', registrationController.register);

export default router;
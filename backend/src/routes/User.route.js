import express from 'express';
import { getProfile, updateProfile } from '../controllers/User.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);

export default router;

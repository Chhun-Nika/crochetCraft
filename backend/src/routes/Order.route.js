import express from 'express';
import { createOrder, getOrderHistory, getOrderById } from '../controllers/Order.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import { validateCheckout } from '../middleware/validateCheckout.js';

const router = express.Router();

router.post('/', authenticateJWT, validateCheckout, createOrder);
router.get('/', authenticateJWT, getOrderHistory);
router.get('/:orderId', authenticateJWT, getOrderById);

export default router; 
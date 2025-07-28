import express from 'express';
import { body } from 'express-validator';
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from '../controllers/Cart.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/', authenticateJWT, getCart);

router.post('/', 
  authenticateJWT,
  [
    body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  addToCart
);

router.put('/update/:productId',
  authenticateJWT,
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  updateCartItem
);

router.delete('/remove/:productId', authenticateJWT, removeFromCart);

router.delete('/', authenticateJWT, clearCart);

export default router; 
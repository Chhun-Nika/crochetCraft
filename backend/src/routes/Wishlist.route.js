import express from 'express';
import { body } from 'express-validator';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/Wishlist.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/', authenticateJWT, getWishlist);

router.post('/', 
  authenticateJWT,
  [
    body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  ],
  addToWishlist
);

router.delete('/remove/:productId', authenticateJWT, removeFromWishlist);

export default router; 
import express from 'express';
import { getAllCategories, getProductsByCategory } from '../controllers/Category.controller.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id/products', getProductsByCategory);

export default router; 
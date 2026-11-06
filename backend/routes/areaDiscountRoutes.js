import express from 'express';
import { addDiscount, getDiscounts, deleteDiscount, checkDiscount } from '../controllers/areaDiscountController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, adminOnly, addDiscount);
router.get('/', protect, adminOnly, getDiscounts);
router.delete('/:id', protect, adminOnly, deleteDiscount);

router.get('/check/:pincode', protect, checkDiscount);

export default router;

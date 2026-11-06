import express from 'express';
import { addDiscount, getDiscounts, deleteDiscount, checkDiscount } from '../controllers/areaDiscountController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { checkObjectId } from '../middleware/validateId.js';

const router = express.Router();

// 🚀 Invalid MongoDB ids get a 400 instead of a 500
router.param('id', checkObjectId);

router.post('/', protect, adminOnly, addDiscount);
router.get('/', protect, adminOnly, getDiscounts);
router.delete('/:id', protect, adminOnly, deleteDiscount);

router.get('/check/:pincode', protect, checkDiscount);

export default router;

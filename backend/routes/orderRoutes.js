import express from 'express';
import { placeOrder, getMyOrders, getVendorOrders, updateOrderStatus, handleReturnDecision } from '../controllers/orderController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/myorders', protect, getMyOrders);

// 🚀 NEW: VENDOR ROUTES
router.get('/vendor', protect, vendorOnly, getVendorOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/return-decision', protect, vendorOnly, handleReturnDecision);

export default router;
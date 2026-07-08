import express from 'express';
import { placeOrder, getMyOrders, getVendorOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/myorders', protect, getMyOrders);

// 🚀 NEW: VENDOR ROUTES
router.get('/vendor', protect, vendorOnly, getVendorOrders);
router.put('/:id/status', protect, vendorOnly, updateOrderStatus);

export default router;
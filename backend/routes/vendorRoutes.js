import express from 'express';
import { addVendorInventory } from '../controllers/medicineController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add or update inventory (Only Vendors can do this)
router.post('/inventory', protect, vendorOnly, addVendorInventory);

export default router;
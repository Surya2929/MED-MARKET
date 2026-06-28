import express from 'express';
import { 
  addMasterMedicine, 
  searchAndCompare, 
  getNearbyStores, 
  getVendorInventory, 
  getSuggestions 
} from '../controllers/medicineController.js';

import Medicine from '../models/Medicine.js'; // 🚀 FIX: Import Model for Master fetch
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchAndCompare);
router.get('/stores', getNearbyStores);
router.get('/vendor-inventory', protect, vendorOnly, getVendorInventory);
router.get('/suggestions', getSuggestions);

// 🚀 FIX: THIS ROUTE WAS MISSING! Gets all medicines for Vendor Dropdown
router.get('/master', async (req, res) => {
  try {
    const medicines = await Medicine.find({}).sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/master', protect, addMasterMedicine);

export default router;
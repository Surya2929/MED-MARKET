import express from 'express';
import { 
  addMasterMedicine, 
  searchAndCompare, 
  getNearbyStores, 
  getVendorInventory, 
  getSuggestions, 
  deleteVendorInventory,
  getMasterMedicines, // 🚀 FIX: IMPORTED
  translateTexts
} from '../controllers/medicineController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchAndCompare);
router.get('/stores', getNearbyStores);
router.get('/vendor-inventory', protect, vendorOnly, getVendorInventory);
router.get('/suggestions', getSuggestions);
router.get('/master', getMasterMedicines); // 🚀 FIX: DICTIONARY ROUTE
router.post('/master', protect, vendorOnly, addMasterMedicine);
router.delete('/vendor-inventory/:medicineId', protect, vendorOnly, deleteVendorInventory);
router.post('/translate', translateTexts);

export default router;
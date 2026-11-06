import express from 'express';
import { 
  addMasterMedicine, 
  searchAndCompare, 
  getNearbyStores, 
  getVendorInventory, 
  getSuggestions, 
  deleteVendorInventory,
  getMasterMedicines, // 🚀 FIX: IMPORTED
  translateTexts,
  getSubstitutes
} from '../controllers/medicineController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';
import { checkObjectId } from '../middleware/validateId.js';
import { translateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// 🚀 Invalid MongoDB ids get a 400 instead of a 500
router.param('id', checkObjectId);
router.param('medicineId', checkObjectId);

router.get('/search', searchAndCompare);
router.get('/stores', getNearbyStores);
router.get('/vendor-inventory', protect, vendorOnly, getVendorInventory);
router.get('/suggestions', getSuggestions);
router.get('/master', getMasterMedicines); // 🚀 FIX: DICTIONARY ROUTE
router.post('/master', protect, vendorOnly, addMasterMedicine);
router.delete('/vendor-inventory/:medicineId', protect, vendorOnly, deleteVendorInventory);
router.post('/translate', translateLimiter, translateTexts);
// Kept after the fixed paths above (/search, /stores, /master...) so ":id" never swallows them
router.get('/:id/substitutes', getSubstitutes);

export default router;
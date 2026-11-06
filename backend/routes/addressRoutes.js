import express from 'express';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkObjectId } from '../middleware/validateId.js';

const router = express.Router();

// 🚀 Invalid MongoDB ids get a 400 instead of a 500
router.param('id', checkObjectId);

router.get('/', protect, getAddresses);
router.post('/', protect, addAddress);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);
router.put('/:id/default', protect, setDefaultAddress);

export default router;
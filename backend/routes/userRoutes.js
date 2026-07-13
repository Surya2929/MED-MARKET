import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  toggleBlockUser, 
  verifyStore, 
  rejectVendor,
  getStoreInventoryForAdmin,
  toggleBlockInventory
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// ADMIN ROUTES
router.get('/admin/all', protect, adminOnly, getAllUsers);
router.put('/admin/block/:id', protect, adminOnly, toggleBlockUser);
router.put('/admin/verify-store/:id', protect, adminOnly, verifyStore);
router.delete('/admin/reject-vendor/:id', protect, adminOnly, rejectVendor);
router.get('/admin/store-inventory/:storeId', protect, adminOnly, getStoreInventoryForAdmin);
router.put('/admin/inventory/:id/block', protect, adminOnly, toggleBlockInventory);

export default router;
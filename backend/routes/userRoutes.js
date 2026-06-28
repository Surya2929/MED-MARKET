import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  toggleBlockUser, 
  verifyStore 
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// 🚀 FIX: YAHAN SARE ADMIN ROUTES ADD KIYE HAIN
router.get('/admin/all', protect, adminOnly, getAllUsers);
router.put('/admin/block/:id', protect, adminOnly, toggleBlockUser);
router.put('/admin/verify-store/:id', protect, adminOnly, verifyStore);

export default router;
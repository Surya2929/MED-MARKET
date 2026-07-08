import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  toggleBlockUser, 
  verifyStore, 
  rejectVendor,
  getStoreInventoryForAdmin,
  createReport,      
  getAllReports,     
  updateReportStatus 
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// REPORT ROUTE (For Users/Vendors)
router.post('/report', protect, createReport);

// ADMIN ROUTES
router.get('/admin/all', protect, adminOnly, getAllUsers);
router.put('/admin/block/:id', protect, adminOnly, toggleBlockUser);
router.put('/admin/verify-store/:id', protect, adminOnly, verifyStore);
router.delete('/admin/reject-vendor/:id', protect, adminOnly, rejectVendor);
router.get('/admin/store-inventory/:storeId', protect, adminOnly, getStoreInventoryForAdmin);

// ADMIN REPORT ROUTES
router.get('/admin/reports', protect, adminOnly, getAllReports);
router.put('/admin/reports/:id', protect, adminOnly, updateReportStatus);

export default router;
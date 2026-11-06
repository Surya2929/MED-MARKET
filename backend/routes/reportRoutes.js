import express from 'express';
import { createReport, getMyReports, getReportByOrder, getReportThread, addMessage, getAllReports, updateReportStatus } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { checkObjectId } from '../middleware/validateId.js';

const router = express.Router();

// 🚀 Invalid MongoDB ids get a 400 instead of a 500
router.param('id', checkObjectId);
router.param('orderId', checkObjectId);

router.post('/', protect, createReport);
router.get('/mine', protect, getMyReports);
router.get('/by-order/:orderId', protect, getReportByOrder);
router.get('/admin/all', protect, adminOnly, getAllReports);
router.put('/admin/:id/status', protect, adminOnly, updateReportStatus);
router.get('/:id', protect, getReportThread);
router.post('/:id/message', protect, addMessage);

export default router;
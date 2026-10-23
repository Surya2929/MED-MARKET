import express from 'express';
import { askAI, checkInteraction } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/', protect, askAI);


router.post('/interaction', protect, checkInteraction);

export default router;
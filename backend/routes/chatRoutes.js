import express from 'express';
import { askAI, checkInteraction } from '../controllers/chatController.js';

const router = express.Router();


router.post('/', askAI);


router.post('/interaction', checkInteraction);

export default router;
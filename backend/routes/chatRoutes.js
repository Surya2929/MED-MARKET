import express from 'express';
import { askAI } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', askAI);

export default router;
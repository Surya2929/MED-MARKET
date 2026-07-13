import express from 'express';
import { registerUser, loginUser, sendOtp, verifyOtp, resetPassword, googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);

export default router; 
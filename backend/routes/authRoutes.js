import express from 'express';
import { register, login, googleLogin, sendOtp, resetPassword } from '../controllers/authController.js';
import { loginLimiter, otpLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/google', loginLimiter, googleLogin);
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/reset-password', otpLimiter, resetPassword);

export default router;
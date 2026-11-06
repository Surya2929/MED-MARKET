import rateLimit from 'express-rate-limit';

// 🚀 Public AI translation (used by guests in Hindi mode): cap per-IP usage so nobody can burn the Groq quota
export const translateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many translation requests. Please try again in a few minutes.' }
});

// 🚀 Login: 10 failed tries per IP in 15 minutes (successful logins don't count), so passwords can't be guessed fast
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' }
});

// 🚀 Forgot password (send OTP + reset): 5 requests per IP in 15 minutes
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many password reset attempts. Please try again after 15 minutes.' }
});

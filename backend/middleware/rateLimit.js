import rateLimit from 'express-rate-limit';

// 🚀 Public AI translation (used by guests in Hindi mode): cap per-IP usage so nobody can burn the Groq quota
export const translateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many translation requests. Please try again in a few minutes.' }
});

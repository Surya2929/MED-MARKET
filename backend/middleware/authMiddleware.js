import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 🚀 1. Protect Routes (For logged-in users only)
export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }

  // Token is valid but the account was deleted
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, user not found' });
  }

  // Check if user is blocked by Admin
  if (req.user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been suspended by Admin.' });
  }

  // Outside the try so errors thrown by the route handler aren't reported as "token failed"
  next();
};

// 🚀 2. Vendor Only Access
export const vendorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a vendor' });
  }
};

// 🚀 3. Admin Only Access
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an Admin' });
  }
};
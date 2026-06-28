import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 🚀 1. Protect Routes (For logged-in users only)
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // 🚀 FIX: FIXED SECRET KEY TO PREVENT TOKEN FAIL ERROR
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MeraMahaSecretKey12345');
      
      req.user = await User.findById(decoded.id).select('-password');
      
      // Check if user is blocked by Admin
      if(req.user && req.user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been suspended by Admin.' });
      }
      
      next();
    } catch (error) {
      console.error("Token Verification Error:", error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
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
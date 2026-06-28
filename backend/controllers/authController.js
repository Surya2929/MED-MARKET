import User from '../models/User.js';
import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 🚀 FIX: SAME FIXED SECRET KEY FOR GENERATION
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'MeraMahaSecretKey12345', { expiresIn: '30d' });
};

// @desc    Register new user or vendor
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, storeName, address, licenseNumber } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists with this email' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, phone, role });

    if (role === 'vendor') {
      if (!storeName || !address || !licenseNumber) {
        await User.findByIdAndDelete(user._id); 
        return res.status(400).json({ message: 'Store details are required for vendors' });
      }
      await Store.create({ vendorId: user._id, storeName, address, licenseNumber, isVerified: false });
    }

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token (Email Login)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if(user.isBlocked) return res.status(403).json({ message: "Your account is suspended." });
      
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🚀 OTP LOGIN LOGIC
// ==========================================
const otpStore = new Map();

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ message: "Valid 10-digit phone number is required" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60000 });

    console.log(`\n================================`);
    console.log(`📱 MOCK SMS TO: ${phone}`);
    console.log(`🔐 YOUR DEMO OTP IS: 1234`); // Demo purposes
    console.log(`================================\n`);
    
    return res.status(200).json({ message: "Demo OTP sent! Please use 1234" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    // DEMO BYPASS: If OTP is 1234, always accept it for demo purposes
    if (otp !== '1234') {
      return res.status(400).json({ message: "Invalid OTP! Please enter 1234." });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: `User_${phone.slice(6)}`,
        email: `${phone}@medmarket.in`,
        password: await bcrypt.hash('random_password', 10), 
        phone: phone,
        role: 'customer'
      });
    }

    if(user.isBlocked) return res.status(403).json({ message: "Your account is suspended." });

    // 🚀 GENERATING PROPER REAL TOKEN FOR OTP USER
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
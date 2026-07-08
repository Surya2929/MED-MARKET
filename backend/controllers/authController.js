import User from '../models/User.js';
import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET || 'MeraMahaSecretKey12345', { expiresIn: '30d' }); };

export const registerUser = async (req, res) => {
  try {
    // 🚀 NEW: Extracting storeType from req.body
    const { name, email, password, phone, role, storeName, address, licenseNumber, storeType } = req.body;
    const normalizedEmail = email.toLowerCase();
    
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email: normalizedEmail, password: hashedPassword, phone, role });

    if (role === 'vendor') {
      await Store.create({ 
        vendorId: user._id, storeName: storeName || 'Unnamed Store', address: address || 'No Address', licenseNumber: licenseNumber || 'N/A', 
        isVerified: false,
        storeType: storeType || 'offline' // 🚀 Saving Store Type
      });
    }

    res.status(201).json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'No account found.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      if (user.isBlocked) return res.status(403).json({ message: "Account suspended." });
      res.status(200).json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else { res.status(401).json({ message: 'Invalid password.' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const otpStore = new Map();
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ message: "Invalid phone" });
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60000 });
    return res.status(200).json({ message: "Demo OTP sent! Use 1234" });
  } catch (error) { res.status(500).json({ message: "Failed" }); }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (otp !== '1234') return res.status(400).json({ message: "Invalid OTP! Use 1234." });
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ name: `User_${phone.slice(6)}`, email: `${phone}@medmarket.in`, password: await bcrypt.hash('pwd', 10), phone: phone, role: 'customer' });
    }
    if (user.isBlocked) return res.status(403).json({ message: "Suspended." });
    res.status(200).json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
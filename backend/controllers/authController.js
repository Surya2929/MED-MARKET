import User from '../models/User.js';
import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🚀 In-memory OTP store — used ONLY for the "Forgot Password" flow now.
// (Phone-OTP LOGIN has been removed; this store is unrelated to logging in.)
const otpStore = new Map(); // phone -> { otp, expiresAt }

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, storeName, address, storeType, licenseNumber } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists with this email.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword, phone, role: role || 'customer' });

    if (role === 'vendor') {
      await Store.create({
        vendorId: user._id,
        storeName: storeName || `${name}'s Store`,
        address: address || '',
        storeType: storeType || 'offline',
        licenseNumber: licenseNumber || '',
        isVerified: false
      });
    }

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 Standard email + password login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });

    let store = null;
    if (user.role === 'vendor') store = await Store.findOne({ vendorId: user._id });

    res.status(200).json({
      _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role,
      store, token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 Google Sign-In — verifies Google's ID token, finds or creates the user
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({ name, email, password: randomPassword, phone: '', role: 'customer' });
    }

    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });

    res.status(200).json({
      _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Google login failed. Please try again.' });
  }
};

// 🚀 FORGOT PASSWORD — step 1: send an OTP to the phone on file
// (This is unrelated to logging in — it's only for resetting a forgotten password.)
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) return res.status(400).json({ message: 'Enter a valid 10-digit phone number.' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'No account found with this phone number.' });

    const otp = generateOtp();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5-minute expiry

    // 🚧 No real SMS gateway connected yet — OTP is logged here for testing purposes only.
    console.log(`🔑 Password reset OTP for ${phone}: ${otp}`);

    res.status(200).json({ message: 'OTP sent to your registered phone number.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 FORGOT PASSWORD — step 2: verify OTP + set the new password
export const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) return res.status(400).json({ message: 'Phone, OTP, and new password are required.' });

    const record = otpStore.get(phone);
    if (!record) return res.status(400).json({ message: 'OTP expired or not requested. Please request a new one.' });
    if (Date.now() > record.expiresAt) { otpStore.delete(phone); return res.status(400).json({ message: 'OTP has expired. Please request a new one.' }); }
    if (record.otp !== otp) return res.status(400).json({ message: 'Incorrect OTP.' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'No account found with this phone number.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    otpStore.delete(phone);

    res.status(200).json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
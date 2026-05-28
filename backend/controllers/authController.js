import User from '../models/User.js';
import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '30d' });
};


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, storeName, address, licenseNumber } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, phone, role });

    
    if (role === 'vendor') {
      if (!storeName || !address || !licenseNumber) {
        await User.findByIdAndDelete(user._id); // Rollback
        return res.status(400).json({ message: 'Store details are required for vendors' });
      }
      await Store.create({ vendorId: user._id, storeName, address, licenseNumber });
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


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
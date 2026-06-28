import User from '../models/User.js';
import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    let profileData = { ...user._doc };
    if (user.role === 'vendor') {
      const store = await Store.findOne({ vendorId: user._id });
      if (store) profileData.store = store;
    }
    res.json(profileData);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update user profile & password
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedUser = await user.save();
    let responseData = {
      _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, role: updatedUser.role,
    };
    if (user.role === 'vendor' && req.body.storeName) {
      const store = await Store.findOne({ vendorId: user._id });
      if (store) {
        store.storeName = req.body.storeName || store.storeName;
        store.address = req.body.address || store.address;
        store.licenseNumber = req.body.licenseNumber || store.licenseNumber;
        await store.save();
        responseData.store = store;
      }
    }
    res.json({ message: "Profile updated successfully!", user: responseData });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ==========================================
// 🚀 ADMIN DASHBOARD CONTROLLERS
// ==========================================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    const stores = await Store.find();
    
    const combinedData = users.map(user => {
      let userData = { ...user._doc };
      if(user.role === 'vendor') {
        userData.store = stores.find(s => s.vendorId.toString() === user._id.toString());
      }
      return userData;
    });

    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked; 
    await user.save();
    res.status(200).json({ message: user.isBlocked ? 'User Suspended' : 'User Unblocked' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const verifyStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    store.isVerified = !store.isVerified; 
    await store.save();
    res.status(200).json({ message: store.isVerified ? 'Store Verified' : 'Store Verification Revoked' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
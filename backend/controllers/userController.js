import User from '../models/User.js';
import Store from '../models/Store.js';
import Inventory from '../models/Inventory.js';
import Report from '../models/Report.js';
import bcrypt from 'bcryptjs';

// ==========================================
// 1. PROFILE MANAGEMENT (User & Vendor)
// ==========================================
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
// 2. ADMIN DASHBOARD CONTROLLERS
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

export const rejectVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Store.findOneAndDelete({ vendorId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Vendor Request Rejected and Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 FIX: This function was missing! Admin views specific store's inventory
export const getStoreInventoryForAdmin = async (req, res) => {
  try {
    const { storeId } = req.params;
    const inventory = await Inventory.find({ storeId }).populate('medicineId', 'name composition');
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. REPORTS & COMPLAINTS CONTROLLERS
// ==========================================
export const createReport = async (req, res) => {
  try {
    const { reportedUserId, reportedStoreId, orderId, reason, description } = req.body;
    
    if (!reason || !description) return res.status(400).json({ message: "Reason and Description are required" });

    const report = await Report.create({
      reportedBy: req.user._id,
      reportedUser: reportedUserId || null,
      reportedStore: reportedStoreId || null,
      orderId: orderId || null,
      reason,
      description
    });

    res.status(201).json({ message: "Report submitted successfully!", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name role email phone')
      .populate('reportedUser', 'name role email phone isBlocked')
      .populate('reportedStore', 'storeName address')
      .populate('orderId', '_id totalAmount status')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = status;
    await report.save();

    res.status(200).json({ message: `Report marked as ${status}`, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

export const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    const transactions = await WalletTransaction.find({ userId: req.user._id })
      .populate('orderId', '_id')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ balance: user?.walletBalance || 0, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const creditWallet = async (userId, amount, description, orderId = null) => {
  await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
  await WalletTransaction.create({ userId, type: 'credit', amount, description, orderId });
};

export const debitWallet = async (userId, amount, description, orderId = null) => {
  await User.findByIdAndUpdate(userId, { $inc: { walletBalance: -amount } });
  await WalletTransaction.create({ userId, type: 'debit', amount, description, orderId });
};
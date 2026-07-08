import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Jiske khilaf report hui
  reportedStore: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, // Ya jis store ke khilaf hui
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Jis order pe panga hua
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Resolved', 'Dismissed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedStore: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Resolved', 'Dismissed'], default: 'Pending' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['customer', 'vendor', 'admin'], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
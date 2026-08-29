import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' }, 
  isBlocked: { type: Boolean, default: false }
  
}, { timestamps: true });

export default mongoose.model('User', userSchema);
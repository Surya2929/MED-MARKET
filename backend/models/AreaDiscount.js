import mongoose from 'mongoose';

const areaDiscountSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true, match: [/^\d{6}$/, 'Pincode must be exactly 6 digits'] },
  areaName: { type: String },
  percent: { type: Number, required: true, min: 1, max: 50 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('AreaDiscount', areaDiscountSchema);

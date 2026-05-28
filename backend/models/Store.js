import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName: { type: String, required: true },
  address: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  isVerified: { type: Boolean, default: false }, // Future scope for admin verification
}, { timestamps: true });

export default mongoose.model('Store', storeSchema);
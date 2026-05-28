import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  price: { type: Number, required: true }, // Vendor's specific price
  stock: { type: Number, required: true, default: 0 },
}, { timestamps: true });


inventorySchema.index({ storeId: 1, medicineId: 1 }, { unique: true });

export default mongoose.model('Inventory', inventorySchema);
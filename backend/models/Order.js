import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } // Price at the time of order
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
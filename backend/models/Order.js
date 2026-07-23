import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } 
    }
  ],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true }, 
  prescriptionImage: { type: String }, // 🚀 BASE64 Image String
  status: { 
    type: String, 
    // 🚀 NEW: Added Cancelled & Returned logic
    enum: ['Pending', 'Accepted', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'], 
    default: 'Pending' 
  },
  cancelReason: { type: String }, // Agar cancel/return kiya toh kyun?
  // 🚀 NEW: Payment tracking
  paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
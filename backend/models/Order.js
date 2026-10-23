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
  walletUsed: { type: Number, default: 0 },
  deliveryAddress: { type: String, required: true }, 
  prescriptionImage: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'], 
    default: 'Pending' 
  },
  cancelReason: { type: String },
  returnPhotos: [{ type: String }],
  returnItems: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
      quantity: { type: Number, required: true }
    }
  ],
  requestType: { type: String, enum: ['Return', 'Refund'] },
  vendorReturnAction: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  vendorRejectionReason: { type: String },
  paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpayRefundId: { type: String }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
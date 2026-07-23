import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import { verifyCartItems } from './orderController.js';

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

// 🚀 In-memory store for pending checkouts awaiting payment confirmation (keyed by Razorpay order id).
// Holds the SERVER-COMPUTED price/stock/prescription check so the /verify step never has to
// trust anything the client sends back after payment.
const pendingCheckouts = new Map();

// Clean up stale pending checkouts older than 30 minutes (in case a user abandons payment)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of pendingCheckouts.entries()) {
    if (now - val.createdAt > 30 * 60 * 1000) pendingCheckouts.delete(key);
  }
}, 10 * 60 * 1000);

export const createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) return res.status(500).json({ message: 'Online payments are not configured on the server yet.' });

    const { storeId, items, deliveryAddress, prescriptionImage } = req.body;
    const { verifiedItems, totalAmount } = await verifyCartItems(storeId, items, deliveryAddress, prescriptionImage);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay wants paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    });

    pendingCheckouts.set(razorpayOrder.id, {
      customerId: req.user._id.toString(),
      storeId,
      deliveryAddress,
      prescriptionImage: prescriptionImage || null,
      items: verifiedItems,
      totalAmount,
      createdAt: Date.now()
    });

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification details.' });
    }

    const pending = pendingCheckouts.get(razorpay_order_id);
    if (!pending) return res.status(400).json({ message: 'Checkout session expired or not found. Please try again.' });
    if (pending.customerId !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized.' });

    // 🚀 Verify the payment is genuine using Razorpay's HMAC signature scheme
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      pendingCheckouts.delete(razorpay_order_id);
      return res.status(400).json({ message: 'Payment verification failed. If money was deducted, it will be auto-refunded within a few days.' });
    }

    // 🚀 Re-check stock right before creating the order (in case it sold out while the user was paying)
    for (const item of pending.items) {
      const inv = await Inventory.findOne({ storeId: pending.storeId, medicineId: item.medicineId });
      if (!inv || inv.stock < item.quantity) {
        pendingCheckouts.delete(razorpay_order_id);
        return res.status(409).json({
          message: 'Sorry, an item in your order sold out while you were paying. Please contact support with your payment ID for a refund.',
          paymentId: razorpay_payment_id
        });
      }
    }

    const order = await Order.create({
      customerId: pending.customerId,
      storeId: pending.storeId,
      deliveryAddress: pending.deliveryAddress,
      prescriptionImage: pending.prescriptionImage,
      items: pending.items,
      totalAmount: pending.totalAmount,
      status: 'Pending',
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    for (const item of pending.items) {
      await Inventory.findOneAndUpdate(
        { storeId: pending.storeId, medicineId: item.medicineId },
        { $inc: { stock: -item.quantity } }
      );
    }

    pendingCheckouts.delete(razorpay_order_id);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { verifyCartItems, reserveStock, releaseStock } from './orderController.js';
import { creditWallet, debitWallet } from './walletController.js';

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

const pendingCheckouts = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of pendingCheckouts.entries()) {
    if (now - val.createdAt > 30 * 60 * 1000) pendingCheckouts.delete(key);
  }
}, 10 * 60 * 1000);

const refundPayment = async (paymentId, amountPaise, notes) => {
  if (!razorpay) throw new Error('Online payments are not configured on the server.');
  return razorpay.payments.refund(paymentId, { amount: amountPaise, notes });
};

// Refunds the part of an online-paid order that went through Razorpay (the wallet part is credited back separately).
// Sets paymentStatus/razorpayRefundId on the order; the caller saves it. Throws if the gateway refund fails.
export const refundOnlinePayment = async (order) => {
  if (order.paymentMethod !== 'Online' || order.paymentStatus !== 'Paid' || !order.razorpayPaymentId) return null;

  const amountPaise = Math.round((order.totalAmount - (order.walletUsed || 0)) * 100);
  if (amountPaise <= 0) return null;

  const refund = await refundPayment(order.razorpayPaymentId, amountPaise, { orderId: order._id.toString(), reason: 'Order cancelled' });
  order.paymentStatus = 'Refunded';
  order.razorpayRefundId = refund.id;
  return refund;
};

export const createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) return res.status(500).json({ message: 'Online payments are not configured on the server yet.' });

    const { storeId, items, deliveryAddress, prescriptionImage, useWallet } = req.body;
    const { verifiedItems, totalAmount, walletUsed, payableAmount } = await verifyCartItems(
      storeId, items, deliveryAddress, prescriptionImage, req.user._id, useWallet
    );

    if (payableAmount <= 0) {
      return res.status(400).json({ message: 'Your wallet balance covers this entire order. Please place it using Cash on Delivery instead — no payment gateway is needed.' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(payableAmount * 100),
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
      walletUsed,
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

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      pendingCheckouts.delete(razorpay_order_id);
      return res.status(400).json({ message: 'Payment verification failed. If money was deducted, it will be auto-refunded within a few days.' });
    }

    // Claim this checkout before any await, so a duplicate verify call for the same payment can't create a second order
    pendingCheckouts.delete(razorpay_order_id);

    const paidAmount = pending.totalAmount - pending.walletUsed;

    // The customer has already paid, so if we can't fulfil the order, give the money back instead of creating it.
    const refundAndReject = async (status, reason, failedText) => {
      let refundId = null;
      try {
        const refund = await refundPayment(razorpay_payment_id, Math.round(paidAmount * 100), { razorpayOrderId: razorpay_order_id, reason });
        refundId = refund.id;
      } catch (refundError) {
        console.error('Razorpay refund error:', refundError?.error?.description || refundError.message, razorpay_payment_id);
      }
      return res.status(status).json({
        message: refundId
          ? `${failedText} Your payment of ₹${paidAmount} has been refunded to your original payment method (usually 5-7 working days).`
          : `${failedText} We could not refund your payment automatically. Please contact support with your payment ID.`,
        paymentId: razorpay_payment_id,
        refundId
      });
    };

    try {
      await reserveStock(pending.storeId, pending.items);
    } catch (stockError) {
      if (stockError.status !== 409) console.error('Stock reservation error:', stockError.message);
      return refundAndReject(409, 'Out of stock after payment', 'Sorry, an item in your order sold out while you were paying.');
    }

    // Take the wallet part before creating the order; the balance may have been spent elsewhere since checkout began
    const orderId = new mongoose.Types.ObjectId();
    const orderTag = `#${orderId.toString().slice(-6)}`;
    if (pending.walletUsed > 0) {
      try {
        await debitWallet(pending.customerId, pending.walletUsed, `Used on Order ${orderTag}`, orderId);
      } catch (walletError) {
        if (walletError.status !== 409) console.error('Wallet debit error after payment:', walletError.message);
        await releaseStock(pending.storeId, pending.items);
        return refundAndReject(409, 'Wallet balance changed', 'Your wallet balance changed while you were paying, so the order was not placed.');
      }
    }

    let order;
    try {
      order = await Order.create({
        _id: orderId,
        customerId: pending.customerId,
        storeId: pending.storeId,
        deliveryAddress: pending.deliveryAddress,
        prescriptionImage: pending.prescriptionImage,
        items: pending.items,
        totalAmount: pending.totalAmount,
        walletUsed: pending.walletUsed,
        status: 'Pending',
        paymentMethod: 'Online',
        paymentStatus: 'Paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });
    } catch (createError) {
      console.error('Order create error after payment:', createError.message);
      await releaseStock(pending.storeId, pending.items);
      if (pending.walletUsed > 0) await creditWallet(pending.customerId, pending.walletUsed, `Reversed: Order ${orderTag} could not be placed`, orderId);
      return refundAndReject(500, 'Order could not be saved', 'Sorry, we could not place your order.');
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
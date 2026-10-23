import Order from '../models/Order.js';
import Store from '../models/Store.js'; 
import Inventory from '../models/Inventory.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import { creditWallet, debitWallet } from './walletController.js';
import { refundOnlinePayment } from './paymentController.js';

// Vendors can only move an order one step forward through fulfilment
const VENDOR_NEXT_STATUS = {
  'Pending': 'Accepted',
  'Accepted': 'Packed',
  'Packed': 'Out for Delivery',
  'Out for Delivery': 'Delivered'
};

// Takes stock for every item. The `stock >= quantity` filter makes the check and the decrement one atomic
// step, so two orders arriving together can never push stock below zero. If any item is short (or the DB
// errors midway), the items already taken are put back and the error is rethrown.
export const reserveStock = async (storeId, items) => {
  const reserved = [];
  try {
    for (const item of items) {
      const updated = await Inventory.findOneAndUpdate(
        { storeId, medicineId: item.medicineId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (!updated) throw { status: 409, message: 'Sorry, one of the items in your cart just went out of stock. Please update your cart and try again.' };
      reserved.push(item);
    }
  } catch (error) {
    await releaseStock(storeId, reserved);
    throw error;
  }
};

export const releaseStock = async (storeId, items) => {
  for (const item of items) {
    await Inventory.findOneAndUpdate(
      { storeId, medicineId: item.medicineId },
      { $inc: { stock: item.quantity } }
    );
  }
};

export const isValidAddress = (address) => {
  if (!address || address.trim().length < 15) return false;
  return /\b\d{6}\b/.test(address);
};

export const verifyCartItems = async (storeId, items, deliveryAddress, prescriptionImage, userId = null, useWallet = false) => {
  if (!items || items.length === 0) throw { status: 400, message: 'No order items' };
  if (!storeId) throw { status: 400, message: 'Store ID is missing.' };
  if (!isValidAddress(deliveryAddress)) throw { status: 400, message: 'Please enter a complete delivery address including a valid 6-digit PIN code.' };

  const verifiedItems = [];
  let requiresPrescription = false;
  for (const item of items) {
    const inv = await Inventory.findOne({ storeId, medicineId: item.medicineId });
    if (!inv) throw { status: 400, message: 'One of the items is no longer available at this store.' };
    if (inv.stock < item.quantity) throw { status: 400, message: 'Only a few units are left in stock for one of your items. Please update your cart.' };
    verifiedItems.push({ medicineId: item.medicineId, quantity: item.quantity, price: inv.price });

    const med = await Medicine.findById(item.medicineId).select('prescriptionRequired');
    if (med?.prescriptionRequired) requiresPrescription = true;
  }

  if (requiresPrescription && !prescriptionImage) {
    throw { status: 400, message: 'A prescription photo is required to order one or more items in your cart.' };
  }

  const itemTotal = verifiedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const deliveryFee = itemTotal > 500 ? 0 : 40;
  const totalAmount = itemTotal + deliveryFee;

  let walletUsed = 0;
  if (useWallet && userId) {
    const user = await User.findById(userId).select('walletBalance');
    const balance = user?.walletBalance || 0;
    walletUsed = Math.min(balance, totalAmount);
  }
  const payableAmount = totalAmount - walletUsed;

  return { verifiedItems, totalAmount, walletUsed, payableAmount };
};

export const placeOrder = async (req, res) => {
  try {
    const { storeId, items, deliveryAddress, prescriptionImage, useWallet } = req.body;
    const { verifiedItems, totalAmount, walletUsed } = await verifyCartItems(
      storeId, items, deliveryAddress, prescriptionImage, req.user._id, useWallet
    );

    await reserveStock(storeId, verifiedItems);

    let order;
    try {
      order = await Order.create({
        customerId: req.user._id,
        storeId,
        deliveryAddress,
        prescriptionImage: prescriptionImage || null,
        items: verifiedItems,
        totalAmount,
        walletUsed,
        status: 'Pending',
        paymentMethod: 'COD',
        paymentStatus: 'Pending'
      });
    } catch (createError) {
      await releaseStock(storeId, verifiedItems);
      throw createError;
    }

    if (walletUsed > 0) {
      await debitWallet(req.user._id, walletUsed, `Used on Order #${order._id.toString().slice(-6)}`, order._id);
    }

    res.status(201).json(order);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('storeId', 'storeName address')
      .populate('items.medicineId', 'name composition dosage uses')
      .populate('returnItems.medicineId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getVendorOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const orders = await Order.find({ storeId: store._id })
      .populate('customerId', 'name phone email')
      .populate('items.medicineId', 'name composition')
      .populate('returnItems.medicineId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason, returnPhotos, returnItems, requestType } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'vendor') {
      const store = await Store.findOne({ vendorId: req.user._id });
      if (!store || order.storeId.toString() !== store._id.toString()) return res.status(403).json({ message: 'Not authorized' });
      if (VENDOR_NEXT_STATUS[order.status] !== status) {
        return res.status(400).json({ message: `Order is '${order.status}' and cannot be moved to '${status}'.` });
      }
      order.status = status;
    }
    else if (req.user.role === 'customer') {
      if (order.customerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your order' });
      
      if (status === 'Cancelled' && (order.status === 'Pending' || order.status === 'Accepted')) {
        // Refund the Razorpay part first; if the gateway refuses, leave the order untouched so the customer can retry
        try {
          await refundOnlinePayment(order);
        } catch (refundError) {
          console.error('Razorpay refund error:', refundError?.error?.description || refundError.message);
          return res.status(502).json({ message: 'We could not start the refund for your online payment, so the order was not cancelled. Please try again in a few minutes.' });
        }

        order.status = 'Cancelled';
        order.cancelReason = cancelReason;

        for (const item of order.items) {
          await Inventory.findOneAndUpdate(
            { storeId: order.storeId, medicineId: item.medicineId },
            { $inc: { stock: item.quantity } } 
          );
        }

        if (order.walletUsed > 0) {
          await creditWallet(req.user._id, order.walletUsed, `Refund for cancelled Order #${order._id.toString().slice(-6)}`, order._id);
        }
      } else if (status === 'Return Requested' && order.status === 'Delivered') {
        if (!Array.isArray(returnItems) || returnItems.length === 0) {
          return res.status(400).json({ message: 'Please select at least one item to return.' });
        }
        if (!requestType || !['Return', 'Refund'].includes(requestType)) {
          return res.status(400).json({ message: "Please specify whether this is a 'Return' or a 'Refund' request." });
        }

        const validatedReturnItems = [];
        for (const reqItem of returnItems) {
          const orderedItem = order.items.find(i => i.medicineId.toString() === reqItem.medicineId);
          if (!orderedItem) return res.status(400).json({ message: 'One of the selected items was not part of this order.' });
          const qty = Number(reqItem.quantity);
          if (!qty || qty < 1 || qty > orderedItem.quantity) {
            return res.status(400).json({ message: `Return quantity for an item must be between 1 and ${orderedItem.quantity}.` });
          }
          validatedReturnItems.push({ medicineId: reqItem.medicineId, quantity: qty });
        }

        order.status = 'Return Requested';
        order.cancelReason = cancelReason;
        order.returnPhotos = Array.isArray(returnPhotos) ? returnPhotos.slice(0, 5) : [];
        order.returnItems = validatedReturnItems;
        order.requestType = requestType;
        order.vendorReturnAction = 'Pending';
        order.vendorRejectionReason = undefined;
      } else {
        return res.status(400).json({ message: 'Order cannot be cancelled/returned at this stage' });
      }
    }

    await order.save();
    res.status(200).json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const handleReturnDecision = async (req, res) => {
  try {
    const { decision, vendorRejectionReason } = req.body;
    const order = await Order.findById(req.params.id).populate('items.medicineId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store || order.storeId.toString() !== store._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (order.status !== 'Return Requested') return res.status(400).json({ message: 'This order has no pending return request.' });

    if (decision === 'Approved') {
      order.status = 'Returned';
      order.vendorReturnAction = 'Approved';

      for (const item of order.returnItems) {
        await Inventory.findOneAndUpdate(
          { storeId: order.storeId, medicineId: item.medicineId },
          { $inc: { stock: item.quantity } }
        );
      }

      if (order.requestType === 'Refund') {
        let refundAmount = 0;
        for (const returnedItem of order.returnItems) {
          const originalItem = order.items.find(i => i.medicineId._id.toString() === returnedItem.medicineId.toString());
          if (originalItem) refundAmount += originalItem.price * returnedItem.quantity;
        }
        if (refundAmount > 0) {
          await creditWallet(
            order.customerId,
            refundAmount,
            `Refund for returned item(s) from Order #${order._id.toString().slice(-6)}`,
            order._id
          );
        }
      }
    } else if (decision === 'Rejected') {
      if (!vendorRejectionReason || !vendorRejectionReason.trim()) return res.status(400).json({ message: 'Please provide a reason for rejecting the return.' });
      order.status = 'Delivered';
      order.vendorReturnAction = 'Rejected';
      order.vendorRejectionReason = vendorRejectionReason.trim();
    } else {
      return res.status(400).json({ message: 'Invalid decision.' });
    }

    await order.save();
    res.status(200).json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
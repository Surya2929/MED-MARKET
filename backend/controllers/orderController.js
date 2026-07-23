import Order from '../models/Order.js';
import Store from '../models/Store.js'; 
import Inventory from '../models/Inventory.js'; // 🚀 Added to update stock
import Medicine from '../models/Medicine.js'; // 🚀 NEW: needed to check prescriptionRequired

// 🚀 NEW: basic sanity check so people can't place an order with a junk/incomplete address —
// requires a reasonable length AND a 6-digit Indian PIN code somewhere in the text.
export const isValidAddress = (address) => {
  if (!address || address.trim().length < 15) return false;
  return /\b\d{6}\b/.test(address); // has a 6-digit PIN code
};

// 🚀 NEW: shared, server-trusted verification — used by both COD (placeOrder) and
// the Razorpay flow (paymentController) so price/stock/prescription checks never diverge.
export const verifyCartItems = async (storeId, items, deliveryAddress, prescriptionImage) => {
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

  return { verifiedItems, totalAmount };
};

export const placeOrder = async (req, res) => {
  try {
    const { storeId, items, deliveryAddress, prescriptionImage } = req.body;

    const { verifiedItems, totalAmount } = await verifyCartItems(storeId, items, deliveryAddress, prescriptionImage);

    const order = await Order.create({
      customerId: req.user._id,
      storeId,
      deliveryAddress,
      prescriptionImage: prescriptionImage || null,
      items: verifiedItems,
      totalAmount,
      status: 'Pending',
      paymentMethod: 'COD',
      paymentStatus: 'Pending'
    });

    // Stock is deducted only after every item passed the checks above
    for (const item of verifiedItems) {
      await Inventory.findOneAndUpdate(
        { storeId, medicineId: item.medicineId },
        { $inc: { stock: -item.quantity } }
      );
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
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'vendor') {
      const store = await Store.findOne({ vendorId: req.user._id });
      if (!store || order.storeId.toString() !== store._id.toString()) return res.status(403).json({ message: 'Not authorized' });
      order.status = status;
    } 
    else if (req.user.role === 'customer') {
      if (order.customerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your order' });
      
      if (status === 'Cancelled' && (order.status === 'Pending' || order.status === 'Accepted')) {
        order.status = 'Cancelled';
        order.cancelReason = cancelReason;

        // 🚀 NEW: RESTORE STOCK IF ORDER IS CANCELLED
        for (const item of order.items) {
          await Inventory.findOneAndUpdate(
            { storeId: order.storeId, medicineId: item.medicineId },
            { $inc: { stock: item.quantity } } 
          );
        }
      } else if (status === 'Return Requested' && order.status === 'Delivered') {
        order.status = 'Return Requested';
        order.cancelReason = cancelReason;
      } else {
        return res.status(400).json({ message: 'Order cannot be cancelled/returned at this stage' });
      }
    }

    await order.save();
    res.status(200).json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
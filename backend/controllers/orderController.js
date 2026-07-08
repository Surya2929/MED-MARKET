import Order from '../models/Order.js';
import Store from '../models/Store.js'; 
import Inventory from '../models/Inventory.js'; // 🚀 Added to update stock

export const placeOrder = async (req, res) => {
  try {
    const { storeId, items, totalAmount, deliveryAddress, prescriptionImage } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: 'No order items' });
    if (!storeId) return res.status(400).json({ message: 'Store ID is missing.' });
    if (!deliveryAddress) return res.status(400).json({ message: 'Delivery address is required.' });

    const order = await Order.create({
      customerId: req.user._id,
      storeId: storeId, 
      deliveryAddress,
      prescriptionImage: prescriptionImage || null, 
      items: items.map(item => ({ medicineId: item.medicineId, quantity: item.quantity, price: item.price })),
      totalAmount,
      status: 'Pending'
    });

    // 🚀 NEW: MINUS STOCK IN REAL TIME
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { storeId: storeId, medicineId: item.medicineId },
        { $inc: { stock: -item.quantity } } 
      );
    }

    res.status(201).json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
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
import Order from '../models/Order.js';

// @desc    Create new order
export const placeOrder = async (req, res) => {
  try {
    const { storeId, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // Creating the order with explicitly matched data
    const order = await Order.create({
      customerId: req.user._id,
      storeId: storeId || items[0].storeId, // Fallback if general storeId is missing
      items: items.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      status: 'Pending'
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('storeId', 'storeName address')
      .populate('items.medicineId', 'name composition dosage uses') // Ensure medicine details come
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: error.message });
  }
};
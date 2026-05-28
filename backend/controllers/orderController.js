import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
export const placeOrder = async (req, res) => {
  try {
    const { storeId, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = await Order.create({
      customerId: req.user._id,
      storeId,
      items,
      totalAmount
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
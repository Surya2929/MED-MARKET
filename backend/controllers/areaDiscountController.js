import AreaDiscount from '../models/AreaDiscount.js';

// 🚀 Finds the 6-digit pincode in an address string. The last match is used because the
// pincode comes near the end of the address (a house number earlier on could also be 6 digits).
export const getPincode = (address) => {
  const matches = String(address || '').match(/\b\d{6}\b/g);
  return matches ? matches[matches.length - 1] : null;
};

// 🚀 Returns the discount amount (in ₹) for this address, or 0 if its pincode has no active discount
export const calculateAreaDiscount = async (address, itemTotal) => {
  const pincode = getPincode(address);
  if (!pincode) return 0;

  const discount = await AreaDiscount.findOne({ pincode, isActive: true });
  if (!discount) return 0;

  return Math.round(itemTotal * discount.percent / 100);
};

// 🚀 ADMIN: add a discount for a pincode
export const addDiscount = async (req, res) => {
  try {
    const { pincode, areaName, percent } = req.body;

    if (!/^\d{6}$/.test(String(pincode || ''))) return res.status(400).json({ message: 'Pincode must be exactly 6 digits.' });
    const value = Number(percent);
    if (!value || value < 1 || value > 50) return res.status(400).json({ message: 'Discount percent must be between 1 and 50.' });

    const exists = await AreaDiscount.findOne({ pincode });
    if (exists) return res.status(400).json({ message: `A discount already exists for pincode ${pincode}.` });

    const discount = await AreaDiscount.create({ pincode, areaName, percent: value });
    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 ADMIN: list all discounts
export const getDiscounts = async (req, res) => {
  try {
    const discounts = await AreaDiscount.find({}).sort({ createdAt: -1 });
    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 ADMIN: delete a discount
export const deleteDiscount = async (req, res) => {
  try {
    const discount = await AreaDiscount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Discount not found.' });
    res.status(200).json({ message: 'Discount deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 LOGGED-IN USER: check the discount percent for a pincode (used by the cart bill)
export const checkDiscount = async (req, res) => {
  try {
    const pincode = String(req.params.pincode || '');
    if (!/^\d{6}$/.test(pincode)) return res.status(200).json({ percent: 0 });

    const discount = await AreaDiscount.findOne({ pincode, isActive: true });
    res.status(200).json({ percent: discount ? discount.percent : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

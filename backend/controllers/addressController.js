import Address from '../models/Address.js';

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json(addresses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;
    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All address fields are required.' });
    }
    if (!/^\d{6}$/.test(pincode)) return res.status(400).json({ message: 'PIN code must be exactly 6 digits.' });
    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });

    const existingCount = await Address.countDocuments({ userId: req.user._id });
    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user._id, label: label || 'Home', fullName, phone, addressLine, city, state, pincode,
      isDefault: shouldBeDefault
    });

    res.status(201).json(address);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    const { label, fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;
    if (pincode && !/^\d{6}$/.test(pincode)) return res.status(400).json({ message: 'PIN code must be exactly 6 digits.' });
    if (phone && !/^\d{10}$/.test(phone)) return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });

    if (isDefault) await Address.updateMany({ userId: req.user._id }, { isDefault: false });

    address.label = label ?? address.label;
    address.fullName = fullName ?? address.fullName;
    address.phone = phone ?? address.phone;
    address.addressLine = addressLine ?? address.addressLine;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.pincode = pincode ?? address.pincode;
    if (typeof isDefault === 'boolean') address.isDefault = isDefault;

    await address.save();
    res.status(200).json(address);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    const wasDefault = address.isDefault;
    await Address.deleteOne({ _id: address._id });

    if (wasDefault) {
      const next = await Address.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (next) { next.isDefault = true; await next.save(); }
    }

    res.status(200).json({ message: 'Address removed.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.status(200).json(address);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
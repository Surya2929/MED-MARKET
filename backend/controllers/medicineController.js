import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import Store from '../models/Store.js';

// @desc    Add a new medicine to Master DB (Vendors/Admins can do this)
// @route   POST /api/medicines/master
export const addMasterMedicine = async (req, res) => {
  try {
    const { name, composition, uses, sideEffects, dosage } = req.body;
    
    // Check if medicine already exists
    const existingMed = await Medicine.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingMed) return res.status(400).json({ message: 'Medicine already exists in master database' });

    const medicine = await Medicine.create({ name, composition, uses, sideEffects, dosage });
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add medicine to Vendor's Store Inventory with custom price
// @route   POST /api/vendor/inventory
export const addVendorInventory = async (req, res) => {
  try {
    const { medicineId, price, stock } = req.body;

    // Get the vendor's store
    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found for this vendor' });

    // Add or Update Inventory
    const inventory = await Inventory.findOneAndUpdate(
      { storeId: store._id, medicineId },
      { price, stock },
      { new: true, upsert: true } // upsert creates if it doesn't exist
    ).populate('medicineId');

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    🔍 Search medicines & Compare Prices across stores (THE USP)
// @route   GET /api/medicines/search?q=paracetamol
export const searchAndCompare = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) return res.status(400).json({ message: 'Search query is required' });

    // 1. Find matching medicines from Master DB
    const medicines = await Medicine.find({ name: { $regex: searchQuery, $options: 'i' } });
    if (medicines.length === 0) return res.status(404).json({ message: 'Medicine not found' });

    const medicineIds = medicines.map(med => med._id);

    // 2. Find all inventory items for these medicines and sort by PRICE (Cheapest first)
    const inventoryResults = await Inventory.find({ medicineId: { $in: medicineIds } })
      .populate('medicineId') // Get medicine details
      .populate('storeId', 'storeName address isVerified') // Get store details
      .sort({ price: 1 }); // SORT BY PRICE ASCENDING (Comparison Magic)

    // 3. Group results by Medicine to format response for Frontend
    const groupedResults = medicines.map(med => {
      const availableStores = inventoryResults.filter(
        inv => inv.medicineId._id.toString() === med._id.toString()
      );
      
      return {
        medicineInfo: med,
        cheapestPrice: availableStores.length > 0 ? availableStores[0].price : null,
        stores: availableStores.map(store => ({
          inventoryId: store._id,
          storeName: store.storeId.storeName,
          address: store.storeId.address,
          isVerified: store.storeId.isVerified,
          price: store.price,
          stock: store.stock
        }))
      };
    });

    res.status(200).json(groupedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
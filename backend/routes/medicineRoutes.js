import Medicine from '../models/Medicine.js';
import express from 'express';
import { addMasterMedicine, searchAndCompare } from '../controllers/medicineController.js';
import { protect, vendorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Search & Compare (Public)
router.get('/search', searchAndCompare);

// Add Master Medicine (Protected, can restrict to admin later)
router.post('/master', protect, addMasterMedicine);

router.get('/master', async (req, res) => {
  try {
    const medicines = await Medicine.find({});
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
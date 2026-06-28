import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  salt: { type: String, required: true },
  manufacturer: { type: String, required: true },
  // Naya Field: Category
  category: { 
    type: String, 
    enum: ['solid', 'liquid', 'powder', 'cream'], 
    default: 'solid' 
  }, 
  composition: { type: String },
  manufactureDate: { type: Date },
  expiryDate: { type: Date, required: true },
  uses: { type: String, required: true },
  sideEffects: { type: String },
  dosage: { type: String },
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);
import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  composition: { type: String, required: true }, 
  uses: { type: String, required: true },
  sideEffects: { type: String, default: "Consult a doctor for side effects." }, 
  dosage: { type: String, default: "As directed by physician" },
  
  // 🚀 NEW FIELDS
  manufacturer: { type: String, default: "Generic / Unspecified" },
  manufactureDate: { type: Date },
  expiryDate: { type: Date },
  
  imageUrl: { type: String, default: null },
  defaultPrice: { type: Number, default: 50 }
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);
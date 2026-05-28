import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  composition: { type: String, required: true },
  uses: { type: String, required: true }, // E.g., "Fever, Headache"
  sideEffects: { type: String }, // E.g., "Nausea, Dizziness"
  dosage: { type: String }, // E.g., "1 tablet twice a day"
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Store from './models/Store.js';
import Medicine from './models/Medicine.js';
import Inventory from './models/Inventory.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/med-marketplace')
  .then(() => console.log('✅ DB Connected for Seeding Check'))
  .catch(err => console.log(err));

const seedDatabase = async () => {
  try {
    // 🚀 FOOLPROOF SAFETY CHECK: Do not delete if data already exists!
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('🛑 SEED ABORTED: Your database already has real data (Users/Vendors).');
      console.log('💡 I did NOT delete your data. You are safe! You can continue developing without losing your stores.');
      process.exit();
    }

    console.log('⏳ Database is completely empty. Injecting initial basic setup...');

    // 1. MASTER DICTIONARY
    const medicinesData = [
      { name: 'Dolo 650', composition: 'Paracetamol 650mg', uses: 'Fever, Body ache', dosage: '1 tablet 6 hours' },
      { name: 'Crocin 650 Advance', composition: 'Paracetamol 650mg', uses: 'Fever, Body ache', dosage: '1 tablet 6 hours' },
      { name: 'Augmentin 625 Duo', composition: 'Amoxicillin + Clavulanic Acid', uses: 'Severe Infections', dosage: '1 tablet twice a day' },
      { name: 'Pantocid DSR', composition: 'Pantoprazole + Domperidone', uses: 'Acidity, Gas', dosage: '1 capsule empty stomach' },
      { name: 'Allegra 120', composition: 'Fexofenadine', uses: 'Skin Allergy, Sneezing', dosage: '1 tablet a day' },
      { name: 'Azithral 500', composition: 'Azithromycin 500mg', uses: 'Bacterial Infections, Throat ache', dosage: '1 tablet a day' },
      { name: 'Cetirizine 10mg', composition: 'Cetirizine', uses: 'Allergy, Runny Nose', dosage: '1 tablet at night' },
      { name: 'Eno Lemon', composition: 'Sodium Bicarbonate, Citric Acid', uses: 'Acidity, Heartburn', dosage: '1 Sachet in water' },
      { name: 'Volini Gel', composition: 'Diclofenac, Menthol', uses: 'Muscle Pain, Sprain', dosage: 'Apply gently' }
    ];

    const insertedMedicines = await Medicine.insertMany(medicinesData);

    // 2. CREATE ONLY 1 SUPER ADMIN (Base setup)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password', salt); 
    await User.create({ name: 'Super Admin', email: 'admin@medmarket.in', password: hash, phone: '0000000000', role: 'admin' });

    console.log('✅ SEED SUCCESSFUL: Initial Admin & Master Dictionary created. You can now add your own vendors!');
    process.exit();
  } catch (error) {
    console.error('❌ Error Seeding Data:', error);
    process.exit(1);
  }
};

seedDatabase();
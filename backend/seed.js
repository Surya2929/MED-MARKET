import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Store from './models/Store.js';
import Medicine from './models/Medicine.js';
import Inventory from './models/Inventory.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/med-marketplace')
  .then(() => console.log('DB Connected for Seeding'))
  .catch(err => console.log(err));

const seedDatabase = async () => {
  try {
    await User.deleteMany();
    await Store.deleteMany();
    await Medicine.deleteMany();
    await Inventory.deleteMany();

    // 1. MEGA MASTER MEDICINE LIST
    const medicinesData = [
      { name: 'Dolo 650', composition: 'Paracetamol 650mg', uses: 'Fever, Body ache', dosage: '1 tablet 6 hours' },
      { name: 'Azithral 500', composition: 'Azithromycin 500mg', uses: 'Bacterial Infections, Throat ache', dosage: '1 tablet a day' },
      { name: 'Cetirizine 10mg', composition: 'Cetirizine', uses: 'Allergy, Runny Nose', dosage: '1 tablet at night' },
      { name: 'Pantocid DSR', composition: 'Pantoprazole + Domperidone', uses: 'Acidity, Gas', dosage: '1 capsule empty stomach' },
      { name: 'Augmentin 625', composition: 'Amoxicillin + Clavulanic Acid', uses: 'Severe Infections', dosage: '1 tablet twice a day' },
      { name: 'Allegra 120', composition: 'Fexofenadine', uses: 'Skin Allergy, Sneezing', dosage: '1 tablet a day' },
      { name: 'Calpol 500', composition: 'Paracetamol 500mg', uses: 'Mild Fever, Headache', dosage: '1 tablet 6 hours' },
      { name: 'Thyronorm 50mcg', composition: 'Thyroxine', uses: 'Hypothyroidism', dosage: '1 tablet morning empty stomach' },
      { name: 'Ecosprin 75', composition: 'Aspirin', uses: 'Blood thinning, Heart attack prevention', dosage: '1 tablet a day' },
      { name: 'Saridon', composition: 'Paracetamol + Propyphenazone + Caffeine', uses: 'Severe Headache', dosage: '1 tablet when required' }
    ];

    const insertedMedicines = await Medicine.insertMany(medicinesData);

    // 2. CREATE VENDORS (Added Budaun & Mathura)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password', salt);
    const v1 = await User.create({ name: 'Rahul Medicos', email: 'v1@test.com', password: hash, phone: '111', role: 'vendor' });
    const v2 = await User.create({ name: 'City Pharmacy', email: 'v2@test.com', password: hash, phone: '222', role: 'vendor' });
    const v3 = await User.create({ name: 'Apollo Pharmacy', email: 'v3@test.com', password: hash, phone: '333', role: 'vendor' });
    const v4 = await User.create({ name: 'Budaun Medical Store', email: 'budaun@test.com', password: hash, phone: '444', role: 'vendor' });
    const v5 = await User.create({ name: 'Mathura Medical Store', email: 'mathura@test.com', password: hash, phone: '555', role: 'vendor' });

    // 3. CREATE STORES (With specific Cities)
    const store1 = await Store.create({ vendorId: v1._id, storeName: 'Rahul Medicos', address: 'Delhi, IN', licenseNumber: 'L1', isVerified: true });
    const store2 = await Store.create({ vendorId: v2._id, storeName: 'City Pharmacy', address: 'Mumbai, IN', licenseNumber: 'L2', isVerified: true });
    const store3 = await Store.create({ vendorId: v3._id, storeName: 'Apollo Pharmacy', address: 'Bangalore, IN', licenseNumber: 'L3', isVerified: true });
    const store4 = await Store.create({ vendorId: v4._id, storeName: 'Budaun Medical Store', address: 'Indra Chowk, Budaun, UP', licenseNumber: 'L4', isVerified: true });
    const store5 = await Store.create({ vendorId: v5._id, storeName: 'Mathura Medical Store', address: 'Krishna Nagar, Mathura, UP', licenseNumber: 'L5', isVerified: true });

    const allStores = [store1, store2, store3, store4, store5];

    // 4. ADD INVENTORIES (Distributing medicines across all 5 stores randomly)
    const inventoryData = [];
    insertedMedicines.forEach((med, index) => {
      const basePrice = Math.floor(Math.random() * 100) + 20; 
      
      // Shuffle stores so different stores have different medicines
      const shuffledStores = allStores.sort(() => 0.5 - Math.random());
      
      // Add medicine to 3 to 5 random stores
      const storesToFill = Math.floor(Math.random() * 3) + 3; 

      for(let i=0; i<storesToFill; i++) {
        inventoryData.push({ 
          storeId: shuffledStores[i]._id, 
          medicineId: med._id, 
          price: basePrice + (Math.floor(Math.random() * 10) - 5), // Price variation +/- 5 rupees
          stock: Math.floor(Math.random() * 100) + 10 
        });
      }
    });

    await Inventory.insertMany(inventoryData);

    console.log('✅ MEGA Database Seeded with Budaun & Mathura Stores!');
    process.exit();
  } catch (error) {
    console.error('❌ Error Seeding Data:', error);
    process.exit(1);
  }
};

seedDatabase();
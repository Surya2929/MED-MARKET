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
    // Purana data clear karein
    await User.deleteMany();
    await Store.deleteMany();
    await Medicine.deleteMany();
    await Inventory.deleteMany();

    // Naya Medicine Data (Added salt, manufacturer, category, expiry)
    const medicinesData = [
      { 
        name: 'Dolo 650', 
        salt: 'Paracetamol 650mg', 
        category: 'solid', 
        manufacturer: 'Micro Labs Ltd', 
        composition: 'Paracetamol 650mg', 
        uses: 'Fever, Body ache', 
        dosage: '1 tablet every 6 hours',
        manufactureDate: new Date('2024-01-01'),
        expiryDate: new Date('2026-12-31')
      },
      { 
        name: 'Crocin 650', 
        salt: 'Paracetamol 650mg', 
        category: 'solid', 
        manufacturer: 'GSK Pharma', 
        composition: 'Paracetamol 650mg', 
        uses: 'Fever, Pain relief', 
        dosage: '1 tablet 3 times a day',
        manufactureDate: new Date('2024-02-01'),
        expiryDate: new Date('2027-01-01')
      },
      { 
        name: 'Diacard Gold', 
        salt: 'Cactus Grandiflorus, Crataegus', 
        category: 'liquid', 
        manufacturer: 'Madaus & Co.', 
        composition: 'Herbal Blend', 
        uses: 'Heart health, Palpitations', 
        dosage: '20 drops twice daily',
        manufactureDate: new Date('2023-11-01'),
        expiryDate: new Date('2025-10-01')
      },
      { 
        name: 'Eno Lemon', 
        salt: 'Svarjiksara, Nimbukamlam', 
        category: 'powder', 
        manufacturer: 'GSK Consumer', 
        composition: 'Sodium Bicarbonate, Citric Acid', 
        uses: 'Acidity, Gas', 
        dosage: '1 sachet in water',
        manufactureDate: new Date('2024-03-01'),
        expiryDate: new Date('2026-03-01')
      },
      { 
        name: 'Volini Gel', 
        salt: 'Diclofenac Diethylamine', 
        category: 'cream', 
        manufacturer: 'Sun Pharma', 
        composition: 'Diclofenac, Menthol', 
        uses: 'Muscle Pain, Back ache', 
        dosage: 'Apply on affected area',
        manufactureDate: new Date('2024-01-15'),
        expiryDate: new Date('2025-12-15')
      },
      { 
        name: 'Azithral 500', 
        salt: 'Azithromycin 500mg', 
        category: 'solid', 
        manufacturer: 'Alembic Ltd', 
        composition: 'Azithromycin', 
        uses: 'Bacterial Infections', 
        dosage: '1 tablet a day',
        manufactureDate: new Date('2023-08-01'),
        expiryDate: new Date('2026-07-01')
      },
      { 
        name: 'Cetirizine 10mg', 
        salt: 'Cetirizine', 
        category: 'solid', 
        manufacturer: 'Cipla', 
        composition: 'Cetirizine Hydrochloride', 
        uses: 'Allergy, Cold', 
        dosage: '1 tablet at night',
        manufactureDate: new Date('2023-05-01'),
        expiryDate: new Date('2026-05-01')
      }
    ];

    const insertedMedicines = await Medicine.insertMany(medicinesData);

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password', salt);
    
    // Create Admin
    await User.create({ name: 'Super Admin', email: 'admin@medmarket.in', password: hash, phone: '0000000000', role: 'admin' });

    // Create Vendors
    const vDelhi = await User.create({ name: 'Delhi Medicals', email: 'delhi@test.com', password: hash, phone: '1111111111', role: 'vendor' });
    const vBudaun = await User.create({ name: 'Budaun Medical Store', email: 'budaun@test.com', password: hash, phone: '2222222222', role: 'vendor' });
    const vMathura1 = await User.create({ name: 'Krishna Pharmacy', email: 'mathura1@test.com', password: hash, phone: '3333333333', role: 'vendor' });

    // Create Stores
    const storeDelhi = await Store.create({ vendorId: vDelhi._id, storeName: 'Delhi Medicals', address: 'Connaught Place, Delhi', licenseNumber: 'DL-01', isVerified: true });
    const storeBudaun = await Store.create({ vendorId: vBudaun._id, storeName: 'Budaun Medical Store', address: 'Indra Chowk, Budaun, UP', licenseNumber: 'UP-BD-02', isVerified: true });
    const storeMathura1 = await Store.create({ vendorId: vMathura1._id, storeName: 'Krishna Pharmacy', address: 'Krishna Nagar, Mathura, UP', licenseNumber: 'UP-MT-03', isVerified: true });

    // Create Inventory
    const inventoryData = [];
    insertedMedicines.forEach((med) => {
      const basePrice = Math.floor(Math.random() * 100) + 20; 
      inventoryData.push({ storeId: storeDelhi._id, medicineId: med._id, price: basePrice, stock: 150 });
      inventoryData.push({ storeId: storeBudaun._id, medicineId: med._id, price: basePrice + 5, stock: 80 });
      inventoryData.push({ storeId: storeMathura1._id, medicineId: med._id, price: basePrice + 10, stock: 60 });
    });
    
    await Inventory.insertMany(inventoryData);

    console.log('✅ DATABASE SEEDED SUCCESSFULLY: All Categories (Solid, Liquid, Powder) included!');
    process.exit();
  } catch (error) {
    console.error('❌ Error Seeding Data:', error);
    process.exit(1);
  }
};

seedDatabase();
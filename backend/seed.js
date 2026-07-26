import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Medicine from "./models/Medicine.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    // ===========================
    // CREATE ADMIN IF NOT EXISTS
    // ===========================

    const admin = await User.findOne({
      email: "admin@medmarket.in",
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash("password", 10);

      await User.create({
        name: "Super Admin",
        email: "admin@medmarket.in",
        password: hashedPassword,
        phone: "9999999999",
        role: "admin",
      });

      console.log("✅ Admin Created");
      console.log("Email    : admin@medmarket.in");
      console.log("Password : password");
    } else {
      console.log("ℹ️ Admin already exists.");
    }

    // ===========================
    // INSERT MEDICINES ONLY ONCE
    // ===========================

    const medicineCount = await Medicine.countDocuments();

    if (medicineCount === 0) {
      await Medicine.insertMany([
        {
          name: "Dolo 650",
          composition: "Paracetamol 650mg",
          uses: "Fever, Body ache",
          dosage: "1 tablet every 6 hours",
        },
        {
          name: "Crocin 650 Advance",
          composition: "Paracetamol 650mg",
          uses: "Fever, Body ache",
          dosage: "1 tablet every 6 hours",
        },
        {
          name: "Augmentin 625 Duo",
          composition: "Amoxicillin + Clavulanic Acid",
          uses: "Severe Infections",
          dosage: "1 tablet twice daily",
        },
        {
          name: "Pantocid DSR",
          composition: "Pantoprazole + Domperidone",
          uses: "Acidity, Gas",
          dosage: "1 capsule before breakfast",
        },
        {
          name: "Allegra 120",
          composition: "Fexofenadine",
          uses: "Skin Allergy, Sneezing",
          dosage: "1 tablet daily",
        },
        {
          name: "Azithral 500",
          composition: "Azithromycin 500mg",
          uses: "Bacterial Infections",
          dosage: "1 tablet daily",
        },
        {
          name: "Cetirizine 10mg",
          composition: "Cetirizine",
          uses: "Allergy, Runny Nose",
          dosage: "1 tablet at night",
        },
        {
          name: "Eno Lemon",
          composition: "Sodium Bicarbonate + Citric Acid",
          uses: "Acidity, Heartburn",
          dosage: "1 sachet in water",
        },
        {
          name: "Volini Gel",
          composition: "Diclofenac + Menthol",
          uses: "Muscle Pain",
          dosage: "Apply gently on affected area",
        },
      ]);

      console.log("✅ Master medicines inserted.");
    } else {
      console.log("ℹ️ Medicines already exist.");
    }

    console.log("\n==============================");
    console.log("✅ Seed Completed Successfully");
    console.log("==============================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
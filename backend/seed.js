import dns from "dns";

// Force Google + Cloudflare DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Store from "./models/Store.js";
import Medicine from "./models/Medicine.js";
import Inventory from "./models/Inventory.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected for Seeding");

    // 🚀 SAFETY CHECK
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      console.log("🛑 SEED ABORTED: Database already contains users.");
      console.log("💡 No data was deleted.");
      process.exit(0);
    }

    console.log("⏳ Empty database detected. Seeding initial data...");

    // Master Medicine Dictionary
    const medicinesData = [
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
    ];

    await Medicine.insertMany(medicinesData);

    // Create Super Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password", salt);

    await User.create({
      name: "Super Admin",
      email: "admin@medmarket.in",
      password: hashedPassword,
      phone: "0000000000",
      role: "admin",
    });

    console.log("✅ SEED SUCCESSFUL!");
    console.log("📧 Admin Email: admin@medmarket.in");
    console.log("🔑 Admin Password: password");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error Seeding Data:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
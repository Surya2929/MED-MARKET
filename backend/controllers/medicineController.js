import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import Store from '../models/Store.js';
import Groq from 'groq-sdk';

// 🚀 UPDATED: addMasterMedicine with New Fields (Startup Grade)
export const addMasterMedicine = async (req, res) => {
  try {
    const { 
      name, composition, uses, sideEffects, dosage, imageUrl, defaultPrice,
      manufacturer, manufactureDate, expiryDate 
    } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Medicine name is required' });

    let medicine = await Medicine.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    
    if (medicine) {
      // Update existing if new info comes
      medicine.manufacturer = manufacturer || medicine.manufacturer;
      medicine.manufactureDate = manufactureDate || medicine.manufactureDate;
      medicine.expiryDate = expiryDate || medicine.expiryDate;
      medicine.imageUrl = imageUrl || medicine.imageUrl;
      medicine.uses = uses || medicine.uses;
      await medicine.save();
      return res.status(200).json(medicine); 
    }
    
    medicine = await Medicine.create({ 
      name, 
      composition: composition || "General Composition", 
      uses: uses || "Medical Use", 
      sideEffects: sideEffects || "Consult a doctor for side effects.", 
      dosage: dosage || "As directed by physician", 
      imageUrl: imageUrl || null,
      defaultPrice: defaultPrice || 50,
      manufacturer: manufacturer || "Generic / Unspecified",
      manufactureDate: manufactureDate || null,
      expiryDate: expiryDate || null
    });
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addVendorInventory = async (req, res) => {
  try {
    const { medicineId, price, stock } = req.body;
    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found for this vendor' });

    const inventory = await Inventory.findOneAndUpdate(
      { storeId: store._id, medicineId },
      { price, stock },
      { new: true, upsert: true }
    ).populate('medicineId');
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMasterMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({}).sort({ name: 1 });
    res.status(200).json(medicines);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getVendorInventory = async (req, res) => {
  try {
    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    const inventory = await Inventory.find({ storeId: store._id }).populate('medicineId');
    res.status(200).json(inventory);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteVendorInventory = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });

    await Inventory.findOneAndDelete({ storeId: store._id, medicineId: medicineId });
    res.status(200).json({ message: 'Medicine removed from inventory successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 ORIGINAL SEARCH & COMPARE WITH GROQ AI (RESTORED 100%)
export const searchAndCompare = async (req, res) => {
  try {
    let { q: searchQuery, city } = req.query; 
    if (!searchQuery) return res.status(400).json({ message: 'Search query is required' });

    searchQuery = String(searchQuery).trim();

    let exactMedicines = await Medicine.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { composition: { $regex: searchQuery, $options: 'i' } } 
      ]
    });

    if (exactMedicines.length === 0 && process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const aiPrompt = `You are a medical API. The user searched for "${searchQuery}". 
        Check if this is a valid medicine. Return ONLY a raw JSON object. No markdown.
        Format: {"isValid": true, "name": "Exact Brand Name", "composition": "Key Ingredients", "uses": "Main uses", "sideEffects": "None", "dosage": "General dose"}
        If invalid, return: {"isValid": false}`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'system', content: aiPrompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.1,
        });

        let aiResponse = chatCompletion.choices[0]?.message?.content || "";
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const medData = JSON.parse(jsonMatch[0]);

          if (medData.isValid === true) {
             const safeName = medData.name || searchQuery;
             let newMed = await Medicine.findOne({ name: { $regex: new RegExp(`^${safeName}$`, 'i') } });
            
             if (!newMed) {
               newMed = await Medicine.create({
                 name: safeName, 
                 composition: medData.composition || "General Composition", 
                 uses: medData.uses || "Medical use", 
                 sideEffects: medData.sideEffects || "None", 
                 dosage: medData.dosage || "As directed by physician",
                 defaultPrice: Math.floor(Math.random() * 100) + 20
               });
             }
             exactMedicines.push(newMed);
          }
        }
      } catch (aiError) { console.error("❌ AI Error:", aiError); }
    }

    if (exactMedicines.length === 0) return res.status(404).json({ message: 'No medicines found' });

    const exactMedicineIds = exactMedicines.map(med => med._id);
    const compositions = exactMedicines.map(med => med.composition);

    const alternativeMedicines = await Medicine.find({
      composition: { $in: compositions },
      _id: { $nin: exactMedicineIds } 
    });
    
    const allMedicineIds = [...exactMedicineIds, ...alternativeMedicines.map(m => m._id)];

    let inventoryResults = await Inventory.find({ medicineId: { $in: allMedicineIds } })
      .populate('medicineId')
      .populate('storeId', 'storeName address isVerified storeType');

    if (city && city !== 'All Cities' && city !== 'Select Location') {
       let cityKeyword = city.split(',').pop().trim().toLowerCase().replace('district', '').trim();
       inventoryResults = inventoryResults.filter(inv => {
         if (!inv.storeId || !inv.storeId.address) return false; 
         const storeAddress = inv.storeId.address.toLowerCase();
         return storeAddress.includes(cityKeyword) || inv.storeId.storeType === 'online'; 
       });
    }

    inventoryResults.sort((a, b) => a.price - b.price);

    const formatResults = (medicinesList) => {
      return medicinesList.map(med => {
        const availableStores = inventoryResults.filter(
          inv => inv.medicineId && inv.medicineId._id.toString() === med._id.toString() && inv.stock > 0 && inv.storeId?.isVerified === true
        );

        return {
          medicineInfo: med,
          cheapestPrice: availableStores.length > 0 ? availableStores[0].price : null,
          stores: {
            local: availableStores.filter(s => s.storeId.storeType !== 'online').map(s => ({
              inventoryId: s._id, storeId: s.storeId._id, storeName: s.storeId.storeName,
              address: s.storeId.address, isVerified: s.storeId.isVerified, price: s.price, stock: s.stock
            })),
            online: availableStores.filter(s => s.storeId.storeType === 'online').map(s => ({
              inventoryId: s._id, storeId: s.storeId._id, storeName: s.storeId.storeName, 
              address: 'Pan-India Delivery', isVerified: true, price: s.price, stock: s.stock
            }))
          }
        };
      }).filter(item => item.stores.local.length > 0 || item.stores.online.length > 0); 
    };

    res.status(200).json({ exactMatches: formatResults(exactMedicines), alternatives: formatResults(alternativeMedicines) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyStores = async (req, res) => {
  try {
    const { city } = req.query;
    let stores = await Store.find({ isVerified: true, storeType: 'offline' }).populate('vendorId', 'name email phone isBlocked');

    if (city && city !== 'All Cities' && city !== 'Select Location') {
      let cityKeyword = city.split(',').pop().trim().toLowerCase().replace('district', '').trim();
      stores = stores.filter(store => store.address.toLowerCase().includes(cityKeyword));
    }
    res.status(200).json(stores.filter(store => !store.vendorId?.isBlocked));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(200).json([]); 

    const suggestions = await Medicine.find({
      $or: [{ name: { $regex: q, $options: 'i' } }, { composition: { $regex: q, $options: 'i' } }]
    }).select('name composition').limit(6); 

    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
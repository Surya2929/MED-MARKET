import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import Store from '../models/Store.js';
import Groq from 'groq-sdk';

export const addMasterMedicine = async (req, res) => {
  try {
    const { name, composition, uses, sideEffects, dosage } = req.body;
    const existingMed = await Medicine.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingMed) return res.status(400).json({ message: 'Medicine already exists in master database' });
    const medicine = await Medicine.create({ name, composition, uses, sideEffects, dosage });
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

export const getVendorInventory = async (req, res) => {
  try {
    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    const inventory = await Inventory.find({ storeId: store._id }).populate('medicineId', 'name composition dosage');
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
        console.log(`🤖 AI is searching Indian Market for: ${searchQuery}`);
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const aiPrompt = `You are a highly accurate Indian Pharmacy Data API. 
        The user searched for exactly this product: "${searchQuery}".
        Identify if this is a known Indian Allopathic medicine, Homeopathic brand (like Diacard), Ayurvedic product, or common OTC product (like Eno, Vicks).
        CRITICAL RULES:
        1. DO NOT guess or auto-correct to a different medicine (e.g., if they search "Eno", DO NOT return "Enoxaparin").
        2. Return ONLY a raw JSON object. No extra text or markdown.
        Format: {"isValid": true, "name": "Exact Searched Brand Name", "composition": "Key Ingredients", "uses": "Main uses", "sideEffects": "None", "dosage": "General dose"}
        If it is complete gibberish (like 'abcd'), return exactly: {"isValid": false}`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'system', content: aiPrompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.0, 
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
                 dosage: medData.dosage || "As directed by physician"
               });

               const allStores = await Store.find(); 
               if (allStores && allStores.length > 0) {
                 const basePrice = Math.floor(Math.random() * 100) + 50; 
                 const inventoryData = allStores.map((store) => ({
                   storeId: store._id,
                   medicineId: newMed._id,
                   price: basePrice + Math.floor(Math.random() * 20),
                   stock: Math.floor(Math.random() * 50) + 10
                 }));
                 await Inventory.insertMany(inventoryData);
               }
             }
             exactMedicines.push(newMed);
          }
        }
      } catch (aiError) {
        console.error("❌ AI Error:", aiError);
      }
    }

    if (exactMedicines.length === 0) return res.status(404).json({ message: 'No medicines found' });

    const exactMedicineIds = exactMedicines.map(med => med._id);
    const compositions = exactMedicines.map(med => med.composition);

    const alternativeMedicines = await Medicine.find({
      composition: { $in: compositions },
      _id: { $nin: exactMedicineIds } 
    });
    
    const altMedicineIds = alternativeMedicines.map(med => med._id);
    const allMedicineIds = [...exactMedicineIds, ...altMedicineIds];

    let inventoryResults = await Inventory.find({ medicineId: { $in: allMedicineIds } })
      .populate('medicineId')
      .populate('storeId', 'storeName address isVerified');

    // 📍 LOCATION FILTER 
    if (city && city !== 'All Cities' && city !== 'Select Location') {
       let cityKeyword = city.split(',').pop().trim().toLowerCase();
       cityKeyword = cityKeyword.replace('district', '').trim();
       
       inventoryResults = inventoryResults.filter(inv => {
         if (!inv.storeId || !inv.storeId.address) return false; 
         const storeAddress = inv.storeId.address.toLowerCase();
         // Include Local Store OR the "Delhi Medicals" which is treated as Online Global Store
         return storeAddress.includes(cityKeyword) || storeAddress.includes('delhi'); 
       });
    }

    inventoryResults.sort((a, b) => a.price - b.price);

    const formatResults = (medicinesList) => {
      return medicinesList.map(med => {
        const availableStores = inventoryResults.filter(
          inv => inv.medicineId && inv.medicineId._id.toString() === med._id.toString() && inv.stock > 0
        );

        // SEPARATING LOCAL AND ONLINE
        const localStores = availableStores.filter(store => !store.storeId.storeName.toLowerCase().includes('delhi'));
        const onlineStores = availableStores.filter(store => store.storeId.storeName.toLowerCase().includes('delhi'));

        return {
          medicineInfo: med,
          cheapestPrice: availableStores.length > 0 ? availableStores[0].price : null,
          stores: {
            local: localStores.map(store => ({
              inventoryId: store._id, storeId: store.storeId._id, storeName: store.storeId.storeName,
              address: store.storeId.address, isVerified: store.storeId.isVerified, price: store.price, stock: store.stock
            })),
            online: onlineStores.map(store => ({
              inventoryId: store._id, storeId: store.storeId._id, storeName: 'MedMarket Express (Online)', 
              address: 'Dispatched via Courier (2-3 days delivery)', 
              isVerified: true, price: store.price, stock: store.stock
            }))
          }
        };
      }).filter(item => item.stores.local.length > 0 || item.stores.online.length > 0); 
    };

    const finalResponse = { 
      exactMatches: formatResults(exactMedicines), 
      alternatives: formatResults(alternativeMedicines) 
    };

    if(finalResponse.exactMatches.length === 0 && finalResponse.alternatives.length === 0) {
      return res.status(404).json({ message: 'No pharmacies found delivering to your location' });
    }

    res.status(200).json(finalResponse);

  } catch (error) {
    console.error("❌ Search Controller Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyStores = async (req, res) => {
  try {
    const { city } = req.query;
    let stores = await Store.find().populate('vendorId', 'name email phone isBlocked');

    if (city && city !== 'All Cities' && city !== 'Select Location') {
      let cityKeyword = city.split(',').pop().trim().toLowerCase();
      cityKeyword = cityKeyword.replace('district', '').trim();
      stores = stores.filter(store => store.address.toLowerCase().includes(cityKeyword) && !store.address.toLowerCase().includes('delhi'));
    }

    const activeStores = stores.filter(store => !store.vendorId?.isBlocked);
    res.status(200).json(activeStores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(200).json([]); 

    const suggestions = await Medicine.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { composition: { $regex: q, $options: 'i' } }
      ]
    }).select('name composition').limit(6); 

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Suggestions API Error:", error);
    res.status(500).json({ message: error.message });
  }
};
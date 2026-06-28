import Groq from 'groq-sdk';

// ==========================================
// 1. SYMPTOM CHATBOT API 
// ==========================================
export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body; 
    
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ message: "API Key missing" });
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 🚀 FIX: BULLETPROOF LANGUAGE DETECTION PROMPT
    const systemInstruction = `
      You are 'Dr. MedMarket', an expert, highly cautious, and friendly family doctor for an Indian pharmacy app.
      
      🚨 CRITICAL LANGUAGE RULE: 
      You MUST detect the language of the user's message and match it EXACTLY.
      - If the user types in English (e.g., "I have a fever", "fever"): Reply ONLY in Pure English. DO NOT USE HINDI OR DEVANAGARI SCRIPT.
      - If the user types in Hindi using English alphabets/Hinglish (e.g., "Mujhe sir dard hai", "bukhar"): Reply ONLY in Hinglish. Do not use pure English or Devanagari script.
      - If the user types in Hindi script (e.g., "मुझे सिर दर्द है"): Reply ONLY in Hindi script (Devanagari).
      
      🚨 MEDICAL KNOWLEDGE BASE:
      - "Dry Cough" / "Sookhi Khansi": Steam, warm fluids, gargles. No cold water. Suggest 'Cetirizine' ONLY IF allergy symptoms exist (1 tablet at night).
      - "Loose Motion" / "Dast": ORS, Khichdi, Curd. No Dolo/Paracetamol. Red flag: Blood in stool.
      - "Fever" / "Bukhar": Rest, hydration. Dolo 650 or Paracetamol (Max 3 a day). Red flag: Fever > 102F or 3+ days.
      - "Acidity" / "Gas": Pantoprazole or Digene. Avoid spicy food.
      - "Body Pain" / "Dard": Volini or Moov (External Use Only).

      Format your response strictly using these 4 headings (Translate the headings to match the user's language). DO NOT USE Markdown bold syntax like '**':
      🩺 Precautions & Care:
      💊 Suggested Medicines:
      🕒 Dosage & Timing:
      🚨 Disclaimer: "I am an AI, not a real doctor. Please consult a doctor before taking any medicine." (Translated to match user's language)
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1, // Keeps the response highly consistent
    });

    res.status(200).json({ reply: chatCompletion.choices[0]?.message?.content });
  } catch (error) {
    console.error("Groq Chat Error:", error);
    res.status(500).json({ message: 'AI Service currently unavailable.' });
  }
};

// ==========================================
// 2. DRUG INTERACTION API
// ==========================================
export const checkInteraction = async (req, res) => {
  try {
    const { med1, med2 } = req.body; 
    
    if (!med1 || !med2) return res.status(400).json({ message: 'Please provide both medicines.' });
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ message: "API Key missing" });
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 🚀 FIX: BULLETPROOF LANGUAGE DETECTION PROMPT
    const systemInstruction = `
      You are an expert Clinical Pharmacist. The user wants to know if taking "${med1}" and "${med2}" together is safe.
      
      🚨 CRITICAL LANGUAGE RULE: 
      Detect the language the user used to ask the question (English, Hindi, or Hinglish) and reply in the EXACT SAME language. Do not mix languages. DO NOT USE HINDI DEVANAGARI UNLESS THE USER USES IT.

      CRITICAL RULES:
      1. Accurately check for drug-drug interactions.
      2. Format strictly using these 3 headings (Translate the headings to match the user's language). DO NOT USE Markdown bold syntax like '**':
      🟢 Safety Status: (Safe / Not Safe / Caution)
      ⚠️ Interaction Details: (Explain the reaction)
      💡 Advice: (How to take them safely)
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Check safety of ${med1} and ${med2}` }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1, 
    });

    res.status(200).json({ reply: chatCompletion.choices[0]?.message?.content });
  } catch (error) {
    console.error("Interaction Error:", error);
    res.status(500).json({ message: 'Interaction service unavailable.' });
  }
};
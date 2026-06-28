import { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLang') || 'English';
  });

  useEffect(() => {
    localStorage.setItem('appLang', language);
  }, [language]);

  const dictionary = {
    English: {
      searchMeds: "Medicines", aiConsult: "AI Consult", cart: "Cart", login: "Log in", signup: "Sign up",
      heroTitle: "Order Genuine Medicines Online", heroSub: "Search by medicine name or salt composition to find the best local prices.",
      searchPlaceholder: "Type medicine name or salt (e.g. Paracetamol)...", searchBtn: "Search", deliverTo: "Deliver to",
      lowestPrices: "Lowest Prices", lowestPricesDesc: "Compare local pharmacies instantly to save money.",
      genuineDrugs: "Genuine Drugs", genuineDrugsDesc: "100% authentic medicines from verified stores.",
      freeAI: "Free AI Consult", freeAIDesc: "Check drug interactions and symptoms via AI.",
      noMeds: "No medicines found near you", bestPrice: "Best Price Available", cheaperAlt: "Cheaper Alternatives (Same Salt)",
      inStock: "In stock", add: "Add", uses: "Uses", composition: "Composition",
      shopByConcern: "Shop by Health Concerns", diabetes: "Diabetes Care", heart: "Heart Care", mental: "Mental Wellness",
      bone: "Bone & Joint", baby: "Baby Care", vitamins: "Vitamins & Supps", 
      viewDetails: "View Details", close: "Close", sideEffects: "Side Effects", dosage: "Dosage", warnings: "Warnings & Precautions",
      manufacturer: "Manufacturer"
    },
    Hindi: {
      searchMeds: "दवाइयां", aiConsult: "AI डॉक्टर", cart: "कार्ट", login: "लॉग इन", signup: "खाता बनाएं",
      heroTitle: "असली दवाइयां ऑनलाइन ऑर्डर करें", heroSub: "सबसे सस्ते दाम खोजने के लिए दवा का नाम या सॉल्ट (salt) टाइप करें।",
      searchPlaceholder: "दवा का नाम या सॉल्ट लिखें...", searchBtn: "खोजें", deliverTo: "डिलीवरी लोकेशन",
      lowestPrices: "सबसे कम दाम", lowestPricesDesc: "आस-पास के मेडिकल स्टोर से तुलना करें और पैसे बचाएं।",
      genuineDrugs: "100% असली दवाइयां", genuineDrugsDesc: "सभी दवाइयां वेरिफाइड और असली दुकानों से।",
      freeAI: "मुफ्त AI डॉक्टर", freeAIDesc: "लक्षण और दवाइयों के रिएक्शन AI डॉक्टर से पूछें।",
      noMeds: "आपके आस-पास कोई दवा नहीं मिली", bestPrice: "सबसे सस्ता दाम", cheaperAlt: "सस्ते विकल्प (वही सॉल्ट)",
      inStock: "स्टॉक में", add: "कार्ट में डालें", uses: "उपयोग (Uses)", composition: "सामग्री (Salt)",
      shopByConcern: "बीमारी के अनुसार खोजें", diabetes: "डायबिटीज", heart: "हार्ट केयर", mental: "मानसिक स्वास्थ्य",
      bone: "हड्डियां और जोड़", baby: "बेबी केयर", vitamins: "विटामिन्स", 
      viewDetails: "दवा की जानकारी", close: "बंद करें", sideEffects: "दुष्प्रभाव (Side Effects)", dosage: "खुराक (Dosage)", warnings: "सावधानियां (किसे नहीं खानी चाहिए)",
      manufacturer: "निर्माता (Manufacturer)"
    }
  };

  const t = (key) => dictionary[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
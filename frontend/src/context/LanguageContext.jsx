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
      // Navbar
      searchMeds: "Medicines", aiConsult: "AI Consult", cart: "Cart", login: "Log in", signup: "Sign up",
      myOrdersNav: "My Orders", myComplaintsNav: "My Complaints", adminPanel: "Admin Panel", vendorDashboardNav: "Dashboard",

      // Home / Search
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
      manufacturer: "Manufacturer",
      fewLeft: "Only few left!", outOfStockLabel: "Out of Stock", inStockLabel: "In Stock",
      rxRequired: "Prescription Required", viewFullDetails: "View Full Details",
      tabletsCapsules: "Tablets / Capsules", liquidSyrup: "Liquid / Syrup / Drops", powderSachets: "Powder / Sachets", creamOintment: "Cream / Ointment / Gel",
      nearbyPharmacies: "Nearby Pharmacies in", noPartnerPharmacies: "No partner pharmacies registered in this area yet.",
      checkSpelling: "Please check the spelling or search using the salt composition.", drugLicense: "Drug License",
      availableAt: "Available At", nearby: "Nearby", onlineDelivery: "Online Delivery", outOfStockLocally: "Out of stock locally.",
      notAvailableOnline: "Not available for online delivery.", medicineNotFound: "Medicine Not Found",
      backToSearchMsg: "Please go back and select a medicine from the search results.", goToSearch: "Go to Search", back: "Back",
      therapeuticUses: "Therapeutic Uses", mfgDate: "Mfg. Date", expDate: "Exp. Date", checkPackaging: "Check Packaging",
      labelWarning: "Please read the label carefully before use. Strictly to be used under medical supervision.",

      // Cart & Checkout
      yourCart: "Your Cart", continueShopping: "Continue Shopping", checkout: "Checkout", backToCart: "Back to Cart",
      cartEmpty: "Your cart is empty", goBack: "Go Back", soldBy: "Sold by", proceedToCheckout: "Proceed to Checkout",
      placeOrder: "Place Order", processing: "Processing...", billDetails: "Bill Details", itemTotal: "Item Total",
      deliveryFee: "Delivery Fee", free: "FREE", toPay: "To Pay", prescriptionOptional: "Prescription (Optional)",
      prescriptionRequiredLabel: "Prescription (Required)", clickToUpload: "Click to upload photo", deliveryAddress: "Delivery Address",
      addressPlaceholder: "House no, street, area, city, state — including 6-digit PIN code",
      addressError: "Enter a complete address with a valid 6-digit PIN code.",
      prescriptionWarning: "One or more medicines in your cart require a valid prescription. You'll need to upload a photo of it at checkout.",
      addressValidationAlert: "Please enter a complete delivery address including a valid 6-digit PIN code.",
      prescriptionValidationAlert: "One or more items in your cart require a prescription. Please upload a photo to continue.",
      orderPlacedSuccess: "Order Placed Successfully!", orderPlaceFail: "Failed to place order.",
      paymentMethod: "Payment Method", cashOnDelivery: "Cash on Delivery", payOnline: "Pay Online",
      paymentNotConfigured: "Online payments aren't set up yet — please use Cash on Delivery.",
      paymentFailed: "Payment failed or was cancelled.", paymentVerifyFailed: "Payment could not be verified. Please contact support if money was deducted.",

      // My Orders
      myOrdersTitle: "My Orders", noOrders: "No orders found", orderNow: "Order Now", placedOn: "Placed on",
      pharmacyInfo: "Pharmacy Info", cancelOrder: "Cancel Order", returnItem: "Return Item", reportIssue: "Report Issue",
      statusPending: "Sent to Store", statusAccepted: "Preparing", statusPacked: "Packed", statusOutForDelivery: "Out for Delivery",
      statusDelivered: "Delivered", statusCancelled: "Cancelled", statusReturnRequested: "Return Requested",
      qty: "Qty", enterCancelReason: "Please enter a reason for", orderMarkedAs: "Order marked as", failedToUpdateOrder: "Failed to update order",
      returnReasonLabel: "Reason for Return", returnReasonWrongItem: "Wrong item delivered", returnReasonDamaged: "Item damaged / broken",
      returnReasonNotWorking: "Not working / expired", returnReasonChangedMind: "Changed my mind", returnReasonOther: "Other",
      describeReturnIssue: "Describe the issue", uploadPhotosOptional: "Upload photos (optional, up to 5)",
      submitReturnRequest: "Submit Return Request", returnRequestSubmitted: "Return request submitted!",
      returnRequestTitle: "Request a Return", returnRejectedBy: "Return rejected by pharmacy", vendorReasonLabel: "Pharmacy's reason",
      returnDetails: "Return Details", customerReason: "Customer's Reason", evidencePhotos: "Evidence Photos",
      approveReturn: "Approve Return", rejectReturn: "Reject Return", rejectReturnPrompt: "Please explain why you're rejecting this return (visible to the customer):",
      returnApprovedMsg: "Return approved. Stock has been restored.", returnRejectedMsg: "Return rejected.",
      viewReturnRequest: "View Return Request", noPhotosUploaded: "No photos uploaded", cancel: "Cancel", submit: "Submit",

      // Complaints
      myComplaintsTitle: "My Complaints", noComplaints: "No complaints yet", noComplaintsDesc: "Complaints you file, or that are filed against you, will show up here.",
      openChat: "Open Chat", against: "Against", againstStore: "Against store",

      // Chatbot
      symptomCheck: "Symptom Check", drugInteraction: "Drug Interaction", typeSymptoms: "Type symptoms or say something...",
      send: "Send", checkInteractionBetween: "Check interaction between two medicines:", medicine1: "Medicine 1", medicine2: "Medicine 2",
      analyze: "Analyze", aiConsultationTitle: "AI Consultation", autoDetectLangs: "Auto-detects English, Hindi & Hinglish",

      // Auth
      welcomeBack: "Welcome Back", pleaseSignIn: "Please sign in to your account", customerTab: "Customer", pharmacyTab: "Pharmacy", adminTab: "Admin",
      emailLogin: "Email Login", phoneOtpLogin: "Phone OTP Login", emailAddress: "Email Address", password: "Password",
      forgotPassword: "Forgot Password?", enterEmail: "Enter your email", enterPassword: "Enter your password",
      phoneNumber: "Phone Number", enter10DigitNumber: "Enter 10-digit number", getOtp: "Get OTP", sendingOtp: "Sending OTP...",
      enterOtp: "Enter OTP", enter4DigitOtp: "Enter 4-digit OTP", signInSecurely: "Sign In securely", verifying: "Verifying...",
      newToMedMarket: "New to MedMarket?", createAccount: "Create an account", resetPasswordTitle: "Reset Password",
      resetPasswordDesc: "We'll verify it's you using an OTP sent to your registered phone.", sendOtp: "Send OTP",
      newPassword: "New Password", resetPasswordBtn: "Reset Password", resetting: "Resetting...", backToLogin: "Back to Login",

      // Register
      registerTitle: "Create Your Account", registerSub: "Join MedMarket to order medicines or sell as a pharmacy",
      fullName: "Full Name", createPassword: "Create Password (min. 6 characters)", alreadyHaveAccount: "Already have an account?",
      iAmCustomer: "I am a Customer", iAmPharmacy: "I am a Pharmacy", joinNetwork: "Join the Healthiest Network.",
      joinNetworkDesc: "Sign up to order medicines safely or register your pharmacy to reach more customers.",
      createAccountTitle: "Create an Account", takesAMinute: "It takes less than a minute.",
      emailAddressPlaceholder: "Email Address", pharmacyDetailsTitle: "Pharmacy Details", localStore: "Local Store",
      nationalOnline: "National (Online)", storeNamePlaceholder: "Store Name", fullLocalAddress: "Full Local Address & City",
      warehouseAddress: "Warehouse Address", drugLicenseNumber: "Drug License Number", creatingAccount: "Creating Account...",
      createAccountBtn: "Create Account", signIn: "Sign in",

      // Profile
      personalDetails: "Personal Details", fullNameLabel: "Full Name", pharmacyDetails: "Pharmacy Details", storeName: "Store Name",
      storeAddress: "Store Address", security: "Security", newPasswordOptional: "New Password (Optional)",
      keepCurrentPassword: "Leave blank to keep current password", saveChanges: "Save Changes", savingChanges: "Saving Changes...",
      loadingProfile: "Loading Profile...",

      // 404
      pageNotFoundMsg: "The page you're looking for doesn't exist or has moved.", backToHome: "Back to Home",

      // Footer
      footerCompany: "Company", footerAboutUs: "About Us", footerHealthArticles: "Health Articles", footerDiseases: "Diseases & Health Conditions",
      footerGeneric: "Understanding Generic Medicines", footerAllBrands: "All Brands", footerFaq: "FAQ & Help",
      footerSocial: "Social", footerLegal: "Legal", footerTerms: "Terms & Conditions", footerPrivacy: "Privacy Policy",
      footerEditorial: "Editorial Policy", footerReturns: "Returns & Cancellations", footerLowestPrice: "Lowest Price Guarantee T&C",
      footerSubscribe: "Subscribe", footerSubscribeDesc: "Claim your complimentary health tips subscription and stay updated on our promotions.",
      footerEmailPlaceholder: "Enter your email ID", footerSubscribeBtn: "Subscribe", footerOfficeAddress: "Registered Office Address",
      footerGrievanceOfficer: "Grievance Officer", footerDownloadApp: "Download MedMarket App",
      footerDownloadAppDesc: "Manage your health with ease. Download our app now and start taking control of your health.",
      footerGetItOn: "Get it on", footerGooglePlay: "Google Play", footerDownloadOn: "Download on the", footerAppStore: "App Store",
      footerContactUs: "Contact Us", footerContactDesc: "Our customer representative team is available 7 days a week from 8:00 am - 10:00 pm.",
      footerSupport: "Support:", footerPhone: "Phone:", footerRights: "All rights reserved. Our content is for informational purposes only.",
      footerSeeMore: "See additional information", footerPaymentPartners: "Our Payment Partners",
    },
    Hindi: {
      // Navbar
      searchMeds: "दवाइयां", aiConsult: "AI डॉक्टर", cart: "कार्ट", login: "लॉग इन", signup: "खाता बनाएं",
      myOrdersNav: "मेरे ऑर्डर", myComplaintsNav: "मेरी शिकायतें", adminPanel: "Admin Panel", vendorDashboardNav: "Dashboard",

      // Home / Search
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
      manufacturer: "निर्माता (Manufacturer)",
      fewLeft: "बहुत कम स्टॉक बचा है!", outOfStockLabel: "स्टॉक खत्म", inStockLabel: "स्टॉक में उपलब्ध",
      rxRequired: "पर्ची (Prescription) जरूरी है", viewFullDetails: "पूरी जानकारी देखें",
      tabletsCapsules: "टैबलेट / कैप्सूल", liquidSyrup: "लिक्विड / सिरप / ड्रॉप्स", powderSachets: "पाउडर / साशे", creamOintment: "क्रीम / ऑइंटमेंट / जेल",
      nearbyPharmacies: "आपके आस-पास की फार्मेसी —", noPartnerPharmacies: "इस इलाके में अभी कोई पार्टनर फार्मेसी रजिस्टर्ड नहीं है।",
      checkSpelling: "कृपया स्पेलिंग चेक करें या सॉल्ट (salt) के नाम से खोजें।", drugLicense: "ड्रग लाइसेंस",
      availableAt: "यहां उपलब्ध है", nearby: "आस-पास", onlineDelivery: "ऑनलाइन डिलीवरी", outOfStockLocally: "आस-पास स्टॉक में नहीं है।",
      notAvailableOnline: "ऑनलाइन डिलीवरी के लिए उपलब्ध नहीं है।", medicineNotFound: "दवा नहीं मिली",
      backToSearchMsg: "कृपया वापस जाकर सर्च रिजल्ट्स से कोई दवा चुनें।", goToSearch: "सर्च पर जाएं", back: "वापस",
      therapeuticUses: "किन बीमारियों में उपयोग होता है", mfgDate: "निर्माण तिथि", expDate: "एक्सपायरी तिथि", checkPackaging: "पैकेजिंग पर देखें",
      labelWarning: "उपयोग से पहले लेबल ध्यान से पढ़ें। केवल डॉक्टर की सलाह पर ही इस्तेमाल करें।",

      // Cart & Checkout
      yourCart: "आपका कार्ट", continueShopping: "खरीदारी जारी रखें", checkout: "चेकआउट", backToCart: "कार्ट पर वापस जाएं",
      cartEmpty: "आपका कार्ट खाली है", goBack: "वापस जाएं", soldBy: "विक्रेता", proceedToCheckout: "चेकआउट करें",
      placeOrder: "ऑर्डर करें", processing: "प्रोसेस हो रहा है...", billDetails: "बिल की जानकारी", itemTotal: "आइटम टोटल",
      deliveryFee: "डिलीवरी शुल्क", free: "मुफ्त", toPay: "कुल भुगतान", prescriptionOptional: "पर्ची (वैकल्पिक)",
      prescriptionRequiredLabel: "पर्ची (जरूरी है)", clickToUpload: "फोटो अपलोड करने के लिए क्लिक करें", deliveryAddress: "डिलीवरी पता",
      addressPlaceholder: "मकान नंबर, गली, इलाका, शहर, राज्य — 6 अंकों के पिन कोड के साथ",
      addressError: "पूरा पता डालें, साथ में सही 6 अंकों का पिन कोड भी।",
      prescriptionWarning: "आपके कार्ट में कुछ दवाइयों के लिए वैध पर्ची (prescription) जरूरी है। चेकआउट के समय उसकी फोटो अपलोड करनी होगी।",
      addressValidationAlert: "कृपया पूरा डिलीवरी पता डालें, साथ में सही 6 अंकों का पिन कोड भी।",
      prescriptionValidationAlert: "आपके कार्ट में कुछ आइटम के लिए पर्ची जरूरी है। कृपया आगे बढ़ने के लिए फोटो अपलोड करें।",
      orderPlacedSuccess: "ऑर्डर सफलतापूर्वक हो गया!", orderPlaceFail: "ऑर्डर करने में समस्या हुई।",
      paymentMethod: "भुगतान का तरीका", cashOnDelivery: "कैश ऑन डिलीवरी", payOnline: "ऑनलाइन भुगतान करें",
      paymentNotConfigured: "अभी ऑनलाइन भुगतान उपलब्ध नहीं है — कृपया कैश ऑन डिलीवरी चुनें।",
      paymentFailed: "भुगतान विफल हुआ या रद्द कर दिया गया।", paymentVerifyFailed: "भुगतान वेरीफाई नहीं हो पाया। अगर पैसे कट गए हैं तो सपोर्ट से संपर्क करें।",

      // My Orders
      myOrdersTitle: "मेरे ऑर्डर", noOrders: "कोई ऑर्डर नहीं मिला", orderNow: "अभी ऑर्डर करें", placedOn: "ऑर्डर किया गया",
      pharmacyInfo: "फार्मेसी जानकारी", cancelOrder: "ऑर्डर रद्द करें", returnItem: "वापसी करें", reportIssue: "शिकायत करें",
      statusPending: "दुकान को भेजा गया", statusAccepted: "तैयार हो रहा है", statusPacked: "पैक हो गया", statusOutForDelivery: "डिलीवरी के लिए निकल गया",
      statusDelivered: "डिलीवर हो गया", statusCancelled: "रद्द हो गया", statusReturnRequested: "वापसी की गुजारिश की गई",
      qty: "मात्रा", enterCancelReason: "कृपया कारण बताएं", orderMarkedAs: "ऑर्डर अपडेट हो गया —", failedToUpdateOrder: "ऑर्डर अपडेट नहीं हो पाया",
      returnReasonLabel: "वापसी का कारण", returnReasonWrongItem: "गलत आइटम भेजा गया", returnReasonDamaged: "आइटम टूटा/खराब आया",
      returnReasonNotWorking: "काम नहीं कर रहा / एक्सपायर हो गया", returnReasonChangedMind: "मन बदल गया", returnReasonOther: "अन्य कारण",
      describeReturnIssue: "समस्या के बारे में बताएं", uploadPhotosOptional: "फोटो अपलोड करें (वैकल्पिक, ज्यादा से ज्यादा 5)",
      submitReturnRequest: "वापसी का अनुरोध भेजें", returnRequestSubmitted: "वापसी का अनुरोध भेज दिया गया!",
      returnRequestTitle: "वापसी का अनुरोध करें", returnRejectedBy: "फार्मेसी ने वापसी अस्वीकार कर दी", vendorReasonLabel: "फार्मेसी का कारण",
      returnDetails: "वापसी की जानकारी", customerReason: "ग्राहक का कारण", evidencePhotos: "सबूत की फोटो",
      approveReturn: "वापसी स्वीकार करें", rejectReturn: "वापसी अस्वीकार करें", rejectReturnPrompt: "बताएं कि आप यह वापसी क्यों अस्वीकार कर रहे हैं (ग्राहक को दिखेगा):",
      returnApprovedMsg: "वापसी स्वीकार हो गई। स्टॉक वापस जुड़ गया है।", returnRejectedMsg: "वापसी अस्वीकार कर दी गई।",
      viewReturnRequest: "वापसी का अनुरोध देखें", noPhotosUploaded: "कोई फोटो अपलोड नहीं हुई", cancel: "रद्द करें", submit: "भेजें",

      // Complaints
      myComplaintsTitle: "मेरी शिकायतें", noComplaints: "अभी कोई शिकायत नहीं है", noComplaintsDesc: "आपकी की हुई, या आपके खिलाफ की गई शिकायतें यहां दिखेंगी।",
      openChat: "चैट खोलें", against: "इनके खिलाफ", againstStore: "इस दुकान के खिलाफ",

      // Chatbot
      symptomCheck: "लक्षण जांचें", drugInteraction: "दवा रिएक्शन जांच", typeSymptoms: "अपने लक्षण लिखें या बोलें...",
      send: "भेजें", checkInteractionBetween: "दो दवाइयों के बीच रिएक्शन जांचें:", medicine1: "दवा 1", medicine2: "दवा 2",
      analyze: "जांचें", aiConsultationTitle: "AI डॉक्टर से सलाह", autoDetectLangs: "अंग्रेजी, हिंदी और हिंग्लिश — तीनों समझता है",

      // Auth
      welcomeBack: "वापसी पर स्वागत है", pleaseSignIn: "कृपया अपने अकाउंट में लॉग इन करें", customerTab: "ग्राहक", pharmacyTab: "फार्मेसी", adminTab: "एडमिन",
      emailLogin: "ईमेल से लॉगिन", phoneOtpLogin: "फोन OTP से लॉगिन", emailAddress: "ईमेल पता", password: "पासवर्ड",
      forgotPassword: "पासवर्ड भूल गए?", enterEmail: "अपना ईमेल डालें", enterPassword: "अपना पासवर्ड डालें",
      phoneNumber: "फोन नंबर", enter10DigitNumber: "10 अंकों का नंबर डालें", getOtp: "OTP पाएं", sendingOtp: "OTP भेजा जा रहा है...",
      enterOtp: "OTP डालें", enter4DigitOtp: "4 अंकों का OTP डालें", signInSecurely: "सुरक्षित लॉग इन करें", verifying: "जांच हो रही है...",
      newToMedMarket: "MedMarket पर नए हैं?", createAccount: "खाता बनाएं", resetPasswordTitle: "पासवर्ड रीसेट करें",
      resetPasswordDesc: "आपके रजिस्टर्ड फोन नंबर पर भेजी गई OTP से हम पहचान वेरीफाई करेंगे।", sendOtp: "OTP भेजें",
      newPassword: "नया पासवर्ड", resetPasswordBtn: "पासवर्ड रीसेट करें", resetting: "रीसेट हो रहा है...", backToLogin: "लॉगिन पर वापस जाएं",

      // Register
      registerTitle: "अपना खाता बनाएं", registerSub: "दवाइयां ऑर्डर करने के लिए, या फार्मेसी के रूप में बेचने के लिए MedMarket जॉइन करें",
      fullName: "पूरा नाम", createPassword: "पासवर्ड बनाएं (कम से कम 6 अक्षर)", alreadyHaveAccount: "पहले से खाता है?",
      iAmCustomer: "मैं एक ग्राहक हूं", iAmPharmacy: "मैं एक फार्मेसी हूं", joinNetwork: "सबसे भरोसेमंद नेटवर्क से जुड़ें।",
      joinNetworkDesc: "सुरक्षित रूप से दवाइयां ऑर्डर करने के लिए साइन अप करें, या ज्यादा ग्राहकों तक पहुंचने के लिए अपनी फार्मेसी रजिस्टर करें।",
      createAccountTitle: "खाता बनाएं", takesAMinute: "इसमें एक मिनट से भी कम समय लगता है।",
      emailAddressPlaceholder: "ईमेल पता", pharmacyDetailsTitle: "फार्मेसी जानकारी", localStore: "लोकल दुकान",
      nationalOnline: "पूरे भारत में (ऑनलाइन)", storeNamePlaceholder: "दुकान का नाम", fullLocalAddress: "पूरा पता और शहर",
      warehouseAddress: "गोदाम का पता", drugLicenseNumber: "ड्रग लाइसेंस नंबर", creatingAccount: "खाता बन रहा है...",
      createAccountBtn: "खाता बनाएं", signIn: "लॉग इन करें",

      // Profile
      personalDetails: "व्यक्तिगत जानकारी", fullNameLabel: "पूरा नाम", pharmacyDetails: "फार्मेसी जानकारी", storeName: "दुकान का नाम",
      storeAddress: "दुकान का पता", security: "सुरक्षा", newPasswordOptional: "नया पासवर्ड (वैकल्पिक)",
      keepCurrentPassword: "पुराना पासवर्ड रखने के लिए खाली छोड़ें", saveChanges: "बदलाव सेव करें", savingChanges: "सेव हो रहा है...",
      loadingProfile: "प्रोफाइल लोड हो रही है...",

      // 404
      pageNotFoundMsg: "यह पेज मौजूद नहीं है या हटा दिया गया है।", backToHome: "होम पर वापस जाएं",

      // Footer
      footerCompany: "कंपनी", footerAboutUs: "हमारे बारे में", footerHealthArticles: "स्वास्थ्य लेख", footerDiseases: "बीमारियां और स्वास्थ्य समस्याएं",
      footerGeneric: "जेनेरिक दवाओं की जानकारी", footerAllBrands: "सभी ब्रांड्स", footerFaq: "मदद व सामान्य सवाल",
      footerSocial: "सोशल मीडिया", footerLegal: "कानूनी जानकारी", footerTerms: "नियम व शर्तें", footerPrivacy: "प्राइवेसी पॉलिसी",
      footerEditorial: "एडिटोरियल पॉलिसी", footerReturns: "रिटर्न व कैंसिलेशन", footerLowestPrice: "सबसे कम दाम की गारंटी की शर्तें",
      footerSubscribe: "सब्सक्राइब करें", footerSubscribeDesc: "मुफ्त हेल्थ टिप्स पाएं और हमारे ऑफर्स की जानकारी सबसे पहले पाएं।",
      footerEmailPlaceholder: "अपना ईमेल डालें", footerSubscribeBtn: "सब्सक्राइब करें", footerOfficeAddress: "रजिस्टर्ड ऑफिस का पता",
      footerGrievanceOfficer: "शिकायत अधिकारी", footerDownloadApp: "MedMarket ऐप डाउनलोड करें",
      footerDownloadAppDesc: "अपनी सेहत आसानी से मैनेज करें। अभी हमारा ऐप डाउनलोड करें।",
      footerGetItOn: "यहां से पाएं", footerGooglePlay: "Google Play", footerDownloadOn: "यहां से डाउनलोड करें", footerAppStore: "App Store",
      footerContactUs: "संपर्क करें", footerContactDesc: "हमारी कस्टमर सपोर्ट टीम हफ्ते के सातों दिन सुबह 8 बजे से रात 10 बजे तक उपलब्ध है।",
      footerSupport: "सपोर्ट:", footerPhone: "फोन:", footerRights: "सभी अधिकार सुरक्षित। हमारा कंटेंट केवल जानकारी के उद्देश्य से है।",
      footerSeeMore: "और जानकारी देखें", footerPaymentPartners: "हमारे पेमेंट पार्टनर",
    }
  };

  const t = (key) => dictionary[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
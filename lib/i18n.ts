import { type AppLanguage } from "@/lib/app-preferences";

type Dictionary = {
  header: {
    installApp: string;
  };
  bottomNav: {
    home: string;
    carpenters: string;
    jobs: string;
    bookings: string;
    profile: string;
  };
  home: {
    quickActions: string;
    topThekedar: string;
    topThekedarSubtitle: string;
    topKarigar: string;
    topKarigarSubtitle: string;
    viewAll: string;
    appEntryTitle: string;
    appEntrySubtitle: string;
    createAccount: string;
    login: string;
    topRated: string;
    activeJobs: string;
    completed: string;
    availableNow: string;
    kycVerified: string;
    kycPending: string;
    jobsLabel: string;
  };
  hero: {
    verifiedProfiles: string;
    cityFilters: string;
    title: string;
    subtitle: string;
    installable: string;
  };
  jobs: {
    searchPlaceholder: string;
    moreFilters: string;
    heading: string;
    empty: string;
    clear: string;
    applyFilters: string;
    pincodeNext: string;
    budgetNext: string;
  };
  carpenters: {
    searchPlaceholder: string;
    availability: string;
    all: string;
    available: string;
    busy: string;
    outstation: string;
    empty: string;
    book: string;
    contact: string;
    bookingNext: string;
    contactNext: string;
    yearsExp: string;
    daily: string;
    halfDay: string;
    portfolio: string;
    mediaItems: string;
    mediaItem: string;
  };
  drawer: {
    thekedarOffers: string;
    myThekedar: string;
    myHajri: string;
    myKarigar: string;
    findKarigar: string;
    carpenters: string;
    switchToLight: string;
    switchToDark: string;
  };
  languageNames: Record<AppLanguage, string>;
};

export const appDictionary: Record<AppLanguage, Dictionary> = {
  en: {
    header: { installApp: "Install app on phone" },
    bottomNav: {
      home: "Home",
      carpenters: "Carpenters",
      jobs: "Jobs",
      bookings: "Bookings",
      profile: "Profile"
    },
    home: {
      quickActions: "Quick actions",
      topThekedar: "Top rated thekedar",
      topThekedarSubtitle: "Best reviewed hiring partners across cities",
      topKarigar: "Top rated karigar",
      topKarigarSubtitle: "Skilled workers with strong ratings and experience",
      viewAll: "View all",
      appEntryTitle: "How do you want to enter the app?",
      appEntrySubtitle: "Browse listings first, then create your account by role.",
      createAccount: "Create account",
      login: "Login",
      topRated: "rated",
      activeJobs: "active jobs",
      completed: "completed",
      availableNow: "Available now",
      kycVerified: "KYC verified",
      kycPending: "KYC pending",
      jobsLabel: "jobs"
    },
    hero: {
      verifiedProfiles: "Verified profiles",
      cityFilters: "City + PIN filters",
      title: "Woodwork hiring, booking aur hajri ek hi app me.",
      subtitle: "Carpenter, contractor aur customer sab ke liye mobile-first experience with simple Hindi-friendly flow.",
      installable: "Low-data friendly and installable PWA"
    },
    jobs: {
      searchPlaceholder: "Search city, skill, pincode...",
      moreFilters: "More filters",
      heading: "Suggested jobs for carpenter role",
      empty: "No jobs found for this search. Try changing filters.",
      clear: "Clear",
      applyFilters: "Apply filters",
      pincodeNext: "Pincode filter next",
      budgetNext: "Budget range next"
    },
    carpenters: {
      searchPlaceholder: "Search carpenter, skill, city...",
      availability: "Availability",
      all: "All",
      available: "Available",
      busy: "Busy",
      outstation: "Outstation",
      empty: "No carpenter found for this filter.",
      book: "Book",
      contact: "Contact",
      bookingNext: "Booking flow will be connected next.",
      contactNext: "Chat/Call quick actions will be connected next.",
      yearsExp: "years exp",
      daily: "Daily",
      halfDay: "Half day",
      portfolio: "Portfolio",
      mediaItems: "media items",
      mediaItem: "media item"
    },
    drawer: {
      thekedarOffers: "Thekedar Offers",
      myThekedar: "My Thekedar",
      myHajri: "My Hajri",
      myKarigar: "My Karigar",
      findKarigar: "Find Karigar",
      carpenters: "Carpenters",
      switchToLight: "Switch to light",
      switchToDark: "Switch to dark"
    },
    languageNames: {
      hi: "Hindi",
      en: "English",
      ta: "Tamil",
      kn: "Kannada"
    }
  },
  hi: {
    header: { installApp: "ऐप इंस्टॉल करें" },
    bottomNav: {
      home: "होम",
      carpenters: "कारीगर",
      jobs: "जॉब्स",
      bookings: "बुकिंग",
      profile: "प्रोफाइल"
    },
    home: {
      quickActions: "क्विक एक्शन",
      topThekedar: "टॉप रेटेड ठेकेदार",
      topThekedarSubtitle: "अलग-अलग शहरों के भरोसेमंद hiring partners",
      topKarigar: "टॉप रेटेड कारीगर",
      topKarigarSubtitle: "अच्छी rating aur experience वाले skilled workers",
      viewAll: "सब देखें",
      appEntryTitle: "ऐप में कैसे एंटर करना है?",
      appEntrySubtitle: "पहले listings देखें, फिर role के हिसाब से account बनाएं.",
      createAccount: "अकाउंट बनाएं",
      login: "लॉगिन",
      topRated: "रेटेड",
      activeJobs: "active jobs",
      completed: "completed",
      availableNow: "अभी उपलब्ध",
      kycVerified: "KYC verified",
      kycPending: "KYC pending",
      jobsLabel: "jobs"
    },
    hero: {
      verifiedProfiles: "Verified profiles",
      cityFilters: "City + PIN filters",
      title: "Woodwork hiring, booking aur hajri ek hi app me.",
      subtitle: "Carpenter, contractor aur customer sab ke liye mobile-first experience with simple Hindi-friendly flow.",
      installable: "Low-data friendly and installable PWA"
    },
    jobs: {
      searchPlaceholder: "शहर, skill, pincode खोजें...",
      moreFilters: "और फिल्टर",
      heading: "कारीगर role ke liye suggested jobs",
      empty: "इस search ke liye अभी job नहीं मिली. Filters बदलकर try करो.",
      clear: "क्लियर",
      applyFilters: "फिल्टर लगाओ",
      pincodeNext: "Pincode filter next",
      budgetNext: "Budget range next"
    },
    carpenters: {
      searchPlaceholder: "कारीगर, skill, city खोजें...",
      availability: "Availability",
      all: "सभी",
      available: "उपलब्ध",
      busy: "Busy",
      outstation: "Outstation",
      empty: "इस filter ke liye अभी carpenter नहीं मिला.",
      book: "बुक",
      contact: "कॉन्टैक्ट",
      bookingNext: "Booking flow next module me connect karenge.",
      contactNext: "Chat/Call quick actions next me connect honge.",
      yearsExp: "साल अनुभव",
      daily: "डेली",
      halfDay: "हाफ डे",
      portfolio: "Portfolio",
      mediaItems: "media items",
      mediaItem: "media item"
    },
    drawer: {
      thekedarOffers: "ठेकेदार ऑफर्स",
      myThekedar: "मेरे ठेकेदार",
      myHajri: "मेरी हाजरी",
      myKarigar: "मेरे कारीगर",
      findKarigar: "कारीगर खोजो",
      carpenters: "कारीगर",
      switchToLight: "लाइट मोड",
      switchToDark: "डार्क मोड"
    },
    languageNames: {
      hi: "Hindi",
      en: "English",
      ta: "Tamil",
      kn: "Kannada"
    }
  },
  ta: {
    header: { installApp: "ஆப்பை இன்ஸ்டால் செய்" },
    bottomNav: {
      home: "முகப்பு",
      carpenters: "காரிகர்",
      jobs: "வேலைகள்",
      bookings: "புக்கிங்",
      profile: "சுயவிவரம்"
    },
    home: {
      quickActions: "விரைவு செயல்கள்",
      topThekedar: "சிறந்த தேக்கேதார்",
      topThekedarSubtitle: "நகரம் முழுக்க உயர்ந்த மதிப்பீடு பெற்ற hiring partners",
      topKarigar: "சிறந்த காரிகர்",
      topKarigarSubtitle: "அனுபவமும் rating-உமும் உள்ள skilled workers",
      viewAll: "அனைத்தும்",
      appEntryTitle: "ஆப்பில் எப்படி உள்ளே வர விரும்புகிறீர்கள்?",
      appEntrySubtitle: "முதலில் listings பாருங்கள், பிறகு role அடிப்படையில் கணக்கு உருவாக்குங்கள்.",
      createAccount: "கணக்கு உருவாக்கு",
      login: "லாகின்",
      topRated: "மதிப்பீடு",
      activeJobs: "active jobs",
      completed: "completed",
      availableNow: "இப்போது available",
      kycVerified: "KYC verified",
      kycPending: "KYC pending",
      jobsLabel: "jobs"
    },
    hero: {
      verifiedProfiles: "Verified profiles",
      cityFilters: "City + PIN filters",
      title: "Woodwork hiring, booking aur hajri ek hi app me.",
      subtitle: "Carpenter, contractor aur customer sab ke liye mobile-first experience with simple Hindi-friendly flow.",
      installable: "Low-data friendly and installable PWA"
    },
    jobs: {
      searchPlaceholder: "நகரம், skill, pincode தேடு...",
      moreFilters: "மேலும் filters",
      heading: "காரிகர் role க்கு suggested jobs",
      empty: "இந்த search க்கு job கிடைக்கவில்லை. Filters மாற்றி முயற்சிக்கவும்.",
      clear: "Clear",
      applyFilters: "Apply filters",
      pincodeNext: "Pincode filter next",
      budgetNext: "Budget range next"
    },
    carpenters: {
      searchPlaceholder: "காரிகர், skill, city தேடு...",
      availability: "Availability",
      all: "All",
      available: "Available",
      busy: "Busy",
      outstation: "Outstation",
      empty: "இந்த filter க்கு carpenter கிடைக்கவில்லை.",
      book: "Book",
      contact: "Contact",
      bookingNext: "Booking flow அடுத்த module-ல் connect ஆகும்.",
      contactNext: "Chat/Call quick actions அடுத்ததாக connect ஆகும்.",
      yearsExp: "yrs exp",
      daily: "Daily",
      halfDay: "Half day",
      portfolio: "Portfolio",
      mediaItems: "media items",
      mediaItem: "media item"
    },
    drawer: {
      thekedarOffers: "தேக்கேதார் ஆஃபர்கள்",
      myThekedar: "என் தேக்கேதார்",
      myHajri: "என் ஹாஜ்ரி",
      myKarigar: "என் காரிகர்",
      findKarigar: "காரிகர் தேடு",
      carpenters: "காரிகர்",
      switchToLight: "லைட் மோடு",
      switchToDark: "டார்க் மோடு"
    },
    languageNames: {
      hi: "Hindi",
      en: "English",
      ta: "Tamil",
      kn: "Kannada"
    }
  },
  kn: {
    header: { installApp: "ಆಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ" },
    bottomNav: {
      home: "ಮುಖಪುಟ",
      carpenters: "ಕಾರಿಗರ್",
      jobs: "ಕೆಲಸಗಳು",
      bookings: "ಬುಕಿಂಗ್",
      profile: "ಪ್ರೊಫೈಲ್"
    },
    home: {
      quickActions: "ಕ್ವಿಕ್ ಆಕ್ಷನ್‌ಗಳು",
      topThekedar: "ಟಾಪ್ ರೇಟೆಡ್ ತೇಕೆದಾರ್",
      topThekedarSubtitle: "ವಿಭಿನ್ನ ನಗರಗಳ ಉತ್ತಮ hiring partners",
      topKarigar: "ಟಾಪ್ ರೇಟೆಡ್ ಕಾರಿಗರ್",
      topKarigarSubtitle: "ಒಳ್ಳೆಯ rating ಮತ್ತು experience ಇರುವ skilled workers",
      viewAll: "ಎಲ್ಲಾ ನೋಡಿ",
      appEntryTitle: "ಆಪ್‌ಗೆ ಹೇಗೆ ಪ್ರವೇಶಿಸಬೇಕು?",
      appEntrySubtitle: "ಮೊದಲು listings ನೋಡಿ, ನಂತರ role ಪ್ರಕಾರ account ರಚಿಸಿ.",
      createAccount: "ಅಕೌಂಟ್ ರಚಿಸಿ",
      login: "ಲಾಗಿನ್",
      topRated: "rated",
      activeJobs: "active jobs",
      completed: "completed",
      availableNow: "ಈಗ ಲಭ್ಯ",
      kycVerified: "KYC verified",
      kycPending: "KYC pending",
      jobsLabel: "jobs"
    },
    hero: {
      verifiedProfiles: "Verified profiles",
      cityFilters: "City + PIN filters",
      title: "Woodwork hiring, booking aur hajri ek hi app me.",
      subtitle: "Carpenter, contractor aur customer sab ke liye mobile-first experience with simple Hindi-friendly flow.",
      installable: "Low-data friendly and installable PWA"
    },
    jobs: {
      searchPlaceholder: "ನಗರ, skill, pincode ಹುಡುಕಿ...",
      moreFilters: "More filters",
      heading: "ಕಾರಿಗರ್ role ಗೆ suggested jobs",
      empty: "ಈ search ಗೆ job ಸಿಗಲಿಲ್ಲ. Filters change ಮಾಡಿ try ಮಾಡಿ.",
      clear: "Clear",
      applyFilters: "Apply filters",
      pincodeNext: "Pincode filter next",
      budgetNext: "Budget range next"
    },
    carpenters: {
      searchPlaceholder: "ಕಾರಿಗರ್, skill, city ಹುಡುಕಿ...",
      availability: "Availability",
      all: "All",
      available: "Available",
      busy: "Busy",
      outstation: "Outstation",
      empty: "ಈ filter ಗೆ carpenter ಸಿಗಲಿಲ್ಲ.",
      book: "Book",
      contact: "Contact",
      bookingNext: "Booking flow next module ನಲ್ಲಿ connect ಆಗುತ್ತದೆ.",
      contactNext: "Chat/Call quick actions next ನಲ್ಲಿ connect ಆಗುತ್ತವೆ.",
      yearsExp: "yrs exp",
      daily: "Daily",
      halfDay: "Half day",
      portfolio: "Portfolio",
      mediaItems: "media items",
      mediaItem: "media item"
    },
    drawer: {
      thekedarOffers: "ತೇಕೆದಾರ್ ಆಫರ್‌ಗಳು",
      myThekedar: "ನನ್ನ ತೇಕೆದಾರ್",
      myHajri: "ನನ್ನ ಹಾಜರಿ",
      myKarigar: "ನನ್ನ ಕಾರಿಗರ್",
      findKarigar: "ಕಾರಿಗರ್ ಹುಡುಕಿ",
      carpenters: "ಕಾರಿಗರ್",
      switchToLight: "ಲೈಟ್ ಮೋಡ್",
      switchToDark: "ಡಾರ್ಕ್ ಮೋಡ್"
    },
    languageNames: {
      hi: "Hindi",
      en: "English",
      ta: "Tamil",
      kn: "Kannada"
    }
  }
};

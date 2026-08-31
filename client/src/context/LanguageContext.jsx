import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    // Navbar / shell
    "nav.home": "Home",
    "nav.properties": "Properties",
    "nav.myProperties": "My Properties",
    "nav.addProperty": "Add Property",
    "nav.bookings": "Bookings",
    "nav.favorites": "Favorites",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.login": "Login",
    "nav.register": "Register",
    "footer.text": "© 2026 Home Rental System. Crafted for modern rentals.",
    "common.loading": "Loading...",

    // Home
    "home.tagline": "Modern rentals, faster decisions",
    "home.title": "Discover the perfect rental in one place.",
    "home.subtitle":
      "Browse premium apartments, houses, and landlord-managed rentals with listings designed for trust, speed, and simplicity.",
    "home.browse": "Browse Properties",
    "home.getStarted": "Get Started",
    "home.quickTitle": "Find the right home fast",
    "home.location": "Location",
    "home.maxPrice": "Max Price",
    "home.bedrooms": "Bedrooms",
    "home.search": "Search",
    "home.whyTitle": "Why choose Home Rental?",
    "home.verified.title": "Verified Listings",
    "home.verified.desc":
      "Every property is reviewed for quality and accuracy before it appears in search results.",
    "home.smart.title": "Smart Search",
    "home.smart.desc":
      "Filter by price, location, bedrooms, and features to find the home that fits your needs.",
    "home.secure.title": "Secure Experience",
    "home.secure.desc":
      "Secure accounts, protected listings, and easy property management for owners and tenants.",

    // Auth
    "login.title": "Log in to your account",
    "login.subtitle":
      "Access your dashboard, saved properties, and rental bookings.",
    "login.forgot": "Forgot password?",
    "login.button": "Login",
    "login.loading": "Logging in...",
    "login.noAccount": "Don't have an account?",
    "login.createOne": "Create one",
    "register.title": "Create your account",
    "register.subtitle":
      "Register as a tenant or landlord and start managing rentals today.",
    "register.tenant": "Tenant",
    "register.landlord": "Landlord",
    "register.button": "Create account",
    "register.loading": "Registering...",
    "register.success": "Registration successful!",
    "register.haveAccount": "Already have an account?",
    "register.logIn": "Log in",
    "form.email": "Email",
    "form.password": "Password",
    "form.fullName": "Full Name",
    "form.phone": "Phone Number",
    "forgot.title": "Forgot password",
    "forgot.button": "Send reset link",
    "forgot.devLink": "Dev reset link:",
    "reset.title": "Reset password",
    "reset.newPassword": "New password",
    "reset.button": "Reset password",
    "verify.title": "Verify email",

    // Properties list
    "properties.title": "Available Properties",
    "properties.searchPlaceholder": "Search by title, city, area...",
    "properties.allTypes": "All Types",
    "properties.anyBedrooms": "Any Bedrooms",
    "properties.bedroomsMin": "Bedrooms",
    "properties.sort.newest": "Newest First",
    "properties.sort.oldest": "Oldest First",
    "properties.sort.priceAsc": "Price: Low to High",
    "properties.sort.priceDesc": "Price: High to Low",
    "properties.minPrice": "Min Price (ETB)",
    "properties.maxPrice": "Max Price (ETB)",
    "properties.search": "Search",
    "properties.reset": "Reset",
    "properties.found": "properties found",
    "properties.foundOne": "property found",
    "properties.none": "No properties found.",
    "properties.prev": "Prev",
    "properties.next": "Next",
    "properties.viewDetails": "View Details",
    "properties.edit": "Edit",
    "properties.delete": "Delete",
    "properties.rented": "Rented",
    "properties.confirmDelete": "Are you sure you want to delete this property?",

    // Property types
    "type.Apartment": "Apartment",
    "type.Villa": "Villa",
    "type.House": "House",
    "type.Studio": "Studio",
    "type.Condominium": "Condominium",
    "type.Office": "Office",
    "type.Commercial Space": "Commercial Space",
    "type.Hostel": "Hostel",
    "type.Shared Room": "Shared Room",
    "type.Guest House": "Guest House",

    // Property details
    "details.bedrooms": "Bedrooms",
    "details.bathrooms": "Bathrooms",
    "details.area": "Area",
    "details.description": "Description",
    "details.amenities": "Amenities",
    "details.ownerInfo": "Owner Information",
    "details.name": "Name",
    "details.email": "Email",
    "details.phone": "Phone",
    "details.perMonth": "/month",
    "details.requestViewing": "Request a Viewing",
    "details.messagePlaceholder": "Message to the owner (optional)",
    "details.sendRequest": "Send Viewing Request",
    "details.ownProperty": "This is your property.",
    "details.editIt": "Edit it",
    "details.orManage": "or manage viewing requests on the",
    "details.bookingsPage": "Bookings page",
    "details.reviews": "Reviews",
    "details.writeReview": "Write a review",
    "details.reviewPlaceholder": "Share your experience with this property...",
    "details.submitReview": "Submit Review",
    "details.delete": "Delete",
    "details.save": "Save",
    "details.saved": "Saved",
    "details.noReviews": "No reviews yet. Be the first!",
    "details.loginTo": "Log in",
    "details.loginToDesc": "to write a review or request a viewing.",
    "details.notFound": "Property not found.",

    // Amenities
    "amenity.Furnished": "Furnished",
    "amenity.Parking": "Parking",
    "amenity.Internet": "Internet",
    "amenity.Balcony": "Balcony",
    "amenity.Garden": "Garden",
    "amenity.Swimming Pool": "Swimming Pool",
    "amenity.Security": "Security",
    "amenity.Pets Allowed": "Pets Allowed",

    // Add / Edit property
    "add.title": "Add Property",
    "add.propertyTitle": "Property Title",
    "add.description": "Description",
    "add.price": "Price",
    "add.location": "Location",
    "add.bedrooms": "Bedrooms",
    "add.bathrooms": "Bathrooms",
    "add.area": "Area (m²)",
    "add.propertyType": "Property Type",
    "add.photos": "Photos (up to 5)",
    "add.button": "Add Property",
    "add.uploading": "Uploading images...",
    "add.saving": "Saving property...",
    "add.success": "Property added successfully!",
    "edit.title": "Edit Property",
    "edit.button": "Save Changes",
    "edit.success": "Property updated successfully!",

    // My properties
    "my.title": "My Properties",
    "my.empty": "You haven't added any properties yet.",
    "my.confirmDelete": "Delete this property?",

    // Dashboard
    "dash.title": "Dashboard",
    "dash.welcome": "Welcome",
    "dash.email": "Email",
    "dash.role": "Role",
    "dash.overview": "Overview",
    "dash.favorites": "Saved Favorites",
    "dash.viewingRequests": "Viewing Requests",
    "dash.myProperties": "My Properties",
    "dash.pendingRequests": "Pending Requests",
    "dash.reviewsWritten": "Reviews Written",
    "dash.loadingStats": "Loading stats...",
    "dash.adminOverview": "Admin Overview",
    "dash.totalUsers": "Total Users",
    "dash.landlords": "Landlords",
    "dash.activeProperties": "Active / Total Properties",
    "dash.totalReviews": "Total Reviews",
    "dash.pendingViewings": "Pending Viewing Requests",
    "dash.recentUsers": "Recent Users",
    "dash.name": "Name",
    "dash.joined": "Joined",
    "dash.notLoggedIn": "You are not logged in.",

    // Bookings
    "bookings.title": "Viewing Requests",
    "bookings.myRequests": "My Requests",
    "bookings.receivedRequests": "Received Requests",
    "bookings.none": "You have not requested any viewings yet.",
    "bookings.browse": "Browse properties",
    "bookings.noneReceived": "No viewing requests on your properties yet.",
    "bookings.cancel": "Cancel",
    "bookings.approve": "Approve",
    "bookings.reject": "Reject",
    "bookings.requestedBy": "Requested by",
    "bookings.owner": "Owner",
    "bookings.propertyRemoved": "Property removed",
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "status.cancelled": "Cancelled",

    // Favorites
    "favorites.title": "My Favorites",
    "favorites.empty": "You have not saved any properties yet.",

    // Profile
    "profile.title": "Your Profile",
    "profile.address": "Address",
    "profile.bio": "Short bio",
    "profile.avatar": "Profile avatar",
    "profile.save": "Save",
    "profile.cancel": "Cancel",
  },

  am: {
    // Navbar / shell
    "nav.home": "መነሻ",
    "nav.properties": "ቤቶች",
    "nav.myProperties": "የእኔ ቤቶች",
    "nav.addProperty": "ቤት ጨምር",
    "nav.bookings": "ቀጠሮዎች",
    "nav.favorites": "ተወዳጆች",
    "nav.dashboard": "ዳሽቦርድ",
    "nav.profile": "መገለጫ",
    "nav.logout": "ውጣ",
    "nav.login": "ግባ",
    "nav.register": "ተመዝገብ",
    "footer.text": "© 2026 የቤት ኪራይ ሲስተም። ለዘመናዊ ኪራይ የተሰራ።",
    "common.loading": "በመጫን ላይ...",

    // Home
    "home.tagline": "ዘመናዊ ኪራዮች፣ ፈጣን ውሳኔዎች",
    "home.title": "ፍጹም የኪራይ ቤት በአንድ ቦታ ያግኙ።",
    "home.subtitle":
      "ለአደራ፣ ለፍጥነት እና ለቀላልነት የተነደፉ ዝርዝሮች ያሏቸውን ምርጥ አፓርታማዎችን፣ ቤቶችን እና በባለቤት የሚተዳደሩ ኪራዮችን ይመልከቱ።",
    "home.browse": "ቤቶችን ይመልከቱ",
    "home.getStarted": "ይጀምሩ",
    "home.quickTitle": "ትክክለኛ ቤት በፍጥነት ያግኙ",
    "home.location": "አድራሻ",
    "home.maxPrice": "ከፍተኛ ዋጋ",
    "home.bedrooms": "መኝታ ክፍሎች",
    "home.search": "ፈልግ",
    "home.whyTitle": "ለምን ይመርጣሉ?",
    "home.verified.title": "የተረጋገጡ ዝርዝሮች",
    "home.verified.desc":
      "እያንዳንዱ ቤት በፍለጋ ውጤቶች ውስጥ ከመታየቱ በፊት ለጥራት እና ለትክክለኛነት ይገመገማል።",
    "home.smart.title": "ብልህ ፍለጋ",
    "home.smart.desc":
      "እንደ ፍላጎትዎ ቤት ለማግኘት በዋጋ፣ በአድራሻ፣ በመኝታ ክፍሎች እና በተጨማሪ አገልግሎቶች ያጣሩ።",
    "home.secure.title": "አስተማማኝ ተሞክሮ",
    "home.secure.desc":
      "ለባለቤቶች እና ለተከራዮች አስተማማኝ መለያዎች፣ የተጠበቁ ዝርዝሮች እና ቀላል የቤት አስተዳደር።",

    // Auth
    "login.title": "ወደ መለያዎ ይግቡ",
    "login.subtitle": "ዳሽቦርድዎን፣ የተቀመጡ ቤቶችን እና ቀጠሮዎችን ይመልከቱ።",
    "login.forgot": "የይለፍ ቃል ረሱት?",
    "login.button": "ግባ",
    "login.loading": "በመግባት ላይ...",
    "login.noAccount": "መለያ የለዎትም?",
    "login.createOne": "ይመዝገቡ",
    "register.title": "መለያ ይፍጠሩ",
    "register.subtitle":
      "እንደ ተከራይ ወይም እንደ አከራይ ይመዝገቡ እና ኪራዮችን ማስተዳደር ይጀምሩ።",
    "register.tenant": "ተከራይ",
    "register.landlord": "አከራይ",
    "register.button": "መለያ ፍጠር",
    "register.loading": "በመመዝገብ ላይ...",
    "register.success": "ምዝገባው በተሳካ ሁኔታ ተጠናቋል!",
    "register.haveAccount": "መለያ አለዎት?",
    "register.logIn": "ይግቡ",
    "form.email": "ኢሜይል",
    "form.password": "የይለፍ ቃል",
    "form.fullName": "ሙሉ ስም",
    "form.phone": "ስልክ ቁጥር",
    "forgot.title": "የይለፍ ቃል ረሱት",
    "forgot.button": "የመመለሻ አገናኝ ላክ",
    "forgot.devLink": "የልማት አገናኝ:",
    "reset.title": "የይለፍ ቃል መለወጫ",
    "reset.newPassword": "አዲስ የይለፍ ቃል",
    "reset.button": "የይለፍ ቃል ቀይር",
    "verify.title": "ኢሜይል ማረጋገጫ",

    // Properties list
    "properties.title": "ያሉ ቤቶች",
    "properties.searchPlaceholder": "በስም፣ በከተማ፣ በአካባቢ ይፈልጉ...",
    "properties.allTypes": "ሁሉም አይነቶች",
    "properties.anyBedrooms": "ማንኛውም መኝታ",
    "properties.bedroomsMin": "መኝታ ክፍሎች",
    "properties.sort.newest": "አዲስ መጀመሪያ",
    "properties.sort.oldest": "አሮጌ መጀመሪያ",
    "properties.sort.priceAsc": "ዋጋ፦ ከዝቅ ወደ ከፍ",
    "properties.sort.priceDesc": "ዋጋ፦ ከከፍ ወደ ዝቅ",
    "properties.minPrice": "ዝቅተኛ ዋጋ (ብር)",
    "properties.maxPrice": "ከፍተኛ ዋጋ (ብር)",
    "properties.search": "ፈልግ",
    "properties.reset": "አጽዳ",
    "properties.found": "ቤቶች ተገኝተዋል",
    "properties.foundOne": "ቤት ተገኝቷል",
    "properties.none": "ምንም ቤቶች አልተገኙም።",
    "properties.prev": "ቀዳሚ",
    "properties.next": "ቀጣይ",
    "properties.viewDetails": "ዝርዝር ተመልከት",
    "properties.edit": "አስተካክል",
    "properties.delete": "ሰርዝ",
    "properties.rented": "ተከራይቷል",
    "properties.confirmDelete": "እርግጠኛ ነዎት ይህን ቤት መሰረዝ ይፈልጋሉ?",

    // Property types
    "type.Apartment": "አፓርታማ",
    "type.Villa": "ቪላ",
    "type.House": "ቤት",
    "type.Studio": "ስቱዲዮ",
    "type.Condominium": "ኮንዶሚኒየም",
    "type.Office": "ቢሮ",
    "type.Commercial Space": "የንግድ ቦታ",
    "type.Hostel": "ሆስቴል",
    "type.Shared Room": "የጋራ ክፍል",
    "type.Guest House": "የእንግዳ ቤት",

    // Property details
    "details.bedrooms": "መኝታ ክፍሎች",
    "details.bathrooms": "ባኞ ክፍሎች",
    "details.area": "ስፋት",
    "details.description": "መግለጫ",
    "details.amenities": "ተጨማሪ አገልግሎቶች",
    "details.ownerInfo": "የባለቤት መረጃ",
    "details.name": "ስም",
    "details.email": "ኢሜይል",
    "details.phone": "ስልክ",
    "details.perMonth": "/ወር",
    "details.requestViewing": "ለመመልከት ቀጠሮ ይጠይቁ",
    "details.messagePlaceholder": "ለባለቤቱ መልዕክት (አማራጭ)",
    "details.sendRequest": "ቀጠሮ ላክ",
    "details.ownProperty": "ይህ የእርስዎ ቤት ነው።",
    "details.editIt": "ያስተካክሉት",
    "details.orManage": "ወይም የመመልከቻ ጥያቄዎችን ያስተዳድሩ በ",
    "details.bookingsPage": "የቀጠሮ ገጽ",
    "details.reviews": "ግምገማዎች",
    "details.writeReview": "ግምገማ ይጻፉ",
    "details.reviewPlaceholder": "ስለዚህ ቤት ያለዎትን ተሞክሮ ያካፍሉ...",
    "details.submitReview": "ግምገማ ላክ",
    "details.delete": "ሰርዝ",
    "details.save": "አስቀምጥ",
    "details.saved": "ተቀምጧል",
    "details.noReviews": "እስካሁን ግምገማ የለም። የመጀመሪያውን ይጻፉ!",
    "details.loginTo": "ይግቡ",
    "details.loginToDesc": "ግምገማ ለመጻፍ ወይም ቀጠሮ ለመጠየቅ።",
    "details.notFound": "ቤቱ አልተገኘም።",

    // Amenities
    "amenity.Furnished": "ዕቃ የተሞላ",
    "amenity.Parking": "መኪና ማቆሚያ",
    "amenity.Internet": "ኢንተርኔት",
    "amenity.Balcony": "በረንዳ",
    "amenity.Garden": "አትክልት",
    "amenity.Swimming Pool": "መዋኛ ገንዳ",
    "amenity.Security": "ደህንነት",
    "amenity.Pets Allowed": "እንስሳት ይፈቀዳል",

    // Add / Edit property
    "add.title": "ቤት ጨምር",
    "add.propertyTitle": "የቤት ርዕስ",
    "add.description": "መግለጫ",
    "add.price": "ዋጋ",
    "add.location": "አድራሻ",
    "add.bedrooms": "መኝታ ክፍሎች",
    "add.bathrooms": "ባኞ ክፍሎች",
    "add.area": "ስፋት (ካ.ሜ)",
    "add.propertyType": "የቤት አይነት",
    "add.photos": "ፎቶዎች (እስከ 5)",
    "add.button": "ቤት ጨምር",
    "add.uploading": "ፎቶዎች በመስቀል ላይ...",
    "add.saving": "ቤቱ በመቀመጥ ላይ...",
    "add.success": "ቤቱ በተሳካ ሁኔታ ተጨምሯል!",
    "edit.title": "ቤት አስተካክል",
    "edit.button": "ለውጦችን አስቀምጥ",
    "edit.success": "ቤቱ በተሳካ ሁኔታ ተዘምኗል!",

    // My properties
    "my.title": "የእኔ ቤቶች",
    "my.empty": "እስካሁን ምንም ቤቶች አልጨመሩም።",
    "my.confirmDelete": "ይህን ቤት መሰረዝ ይፈልጋሉ?",

    // Dashboard
    "dash.title": "ዳሽቦርድ",
    "dash.welcome": "እንኳን ደህና መጡ",
    "dash.email": "ኢሜይል",
    "dash.role": "ሚና",
    "dash.overview": "አጠቃላይ እይታ",
    "dash.favorites": "የተቀመጡ ተወዳጆች",
    "dash.viewingRequests": "የመመልከቻ ጥያቄዎች",
    "dash.myProperties": "የእኔ ቤቶች",
    "dash.pendingRequests": "በመጠበቅ ላይ ያሉ ጥያቄዎች",
    "dash.reviewsWritten": "የተጻፉ ግምገማዎች",
    "dash.loadingStats": "መረጃ በመጫን ላይ...",
    "dash.adminOverview": "የአስተዳዳሪ እይታ",
    "dash.totalUsers": "ጠቅላላ ተጠቃሚዎች",
    "dash.landlords": "አከራዮች",
    "dash.activeProperties": "ንቁ / ጠቅላላ ቤቶች",
    "dash.totalReviews": "ጠቅላላ ግምገማዎች",
    "dash.pendingViewings": "በመጠበቅ ላይ ያሉ ቀጠሮዎች",
    "dash.recentUsers": "አዲስ ተጠቃሚዎች",
    "dash.name": "ስም",
    "dash.joined": "የተመዘገበበት",
    "dash.notLoggedIn": "አልገቡም።",

    // Bookings
    "bookings.title": "የመመልከቻ ቀጠሮዎች",
    "bookings.myRequests": "የእኔ ጥያቄዎች",
    "bookings.receivedRequests": "የደረሱ ጥያቄዎች",
    "bookings.none": "እስካሁን ምንም የመመልከቻ ጥያቄ አላደረጉም።",
    "bookings.browse": "ቤቶችን ይመልከቱ",
    "bookings.noneReceived": "በቤቶችዎ ላይ እስካሁን ምንም ጥያቄ አልደረሰም።",
    "bookings.cancel": "ሰርዝ",
    "bookings.approve": "አጽድቅ",
    "bookings.reject": "ውድቅ አድርግ",
    "bookings.requestedBy": "ጥያቄ ያቀረበው",
    "bookings.owner": "ባለቤት",
    "bookings.propertyRemoved": "ቤቱ ተሰርዟል",
    "status.pending": "በመጠበቅ ላይ",
    "status.approved": "ጸድቋል",
    "status.rejected": "ውድቅ ሆኗል",
    "status.cancelled": "ተሰርዟል",

    // Favorites
    "favorites.title": "የእኔ ተወዳጆች",
    "favorites.empty": "እስካሁን ምንም ቤቶች አላስቀመጡም።",

    // Profile
    "profile.title": "የእርስዎ መገለጫ",
    "profile.address": "አድራሻ",
    "profile.bio": "አጭር መግለጫ",
    "profile.avatar": "የመገለጫ ምስል",
    "profile.save": "አስቀምጥ",
    "profile.cancel": "ተመለስ",
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem("lang") || "en"
  );

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  function t(key) {
    return translations[lang]?.[key] ?? translations.en[key] ?? key;
  }

  function toggleLang() {
    setLang((current) => (current === "en" ? "am" : "en"));
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  return useContext(LanguageContext);
}

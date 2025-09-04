export const translations = {
  en: {
    // Authentication
    signUp: "Sign Up",
    signIn: "Sign In",
    login: "Login",
    logout: "Logout",
    name: "Name",
    username: "Username",
    email: "Email",
    password: "Password",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",

    // Navigation
    home: "Home",
    products: "Products",
    news: "News",
    history: "History",
    profile: "My Profile",

    // Messages
    welcome: "Welcome to Online Full Service",
    gpsRequired: "GPS Permission Required",
    gpsMessage: "Please enable GPS location to use this application",
    enableGPS: "Enable GPS",
    loading: "Loading...",
    success: "Success",
    error: "Error",

    // Validation
    usernameExists: "Username already exists",
    emailExists: "Email already exists",
    invalidCredentials: "Invalid email or password",
    fillAllFields: "Please fill all fields",
  },
  mm: {
    // Authentication
    signUp: "အကောင့်ဖွင့်ရန်",
    signIn: "အကောင့်ဝင်ရန်",
    login: "လော့ဂ်အင်",
    logout: "ထွက်ရန်",
    name: "နာမည်",
    username: "အသုံးပြုသူအမည်",
    email: "အီးမေးလ်",
    password: "စကားဝှက်",
    createAccount: "အကောင့်ဖန်တီးရန်",
    alreadyHaveAccount: "အကောင့်ရှိပြီးသားလား?",
    dontHaveAccount: "အကောင့်မရှိသေးလား?",

    // Navigation
    home: "ပင်မစာမျက်နှာ",
    products: "ကုန်ပစ္စည်းများ",
    news: "သတင်းများ",
    history: "မှတ်တမ်း",
    profile: "ကျွန်ုပ်၏ပရိုဖိုင်",

    // Messages
    welcome: "Online Full Service မှကြိုဆိုပါတယ်",
    gpsRequired: "GPS ခွင့်ပြုချက်လိုအပ်သည်",
    gpsMessage: "ဤအက်ပ်ကိုအသုံးပြုရန် GPS တည်နေရာကိုဖွင့်ပေးပါ",
    enableGPS: "GPS ဖွင့်ရန်",
    loading: "ဖွင့်နေသည်...",
    success: "အောင်မြင်သည်",
    error: "အမှား",

    // Validation
    usernameExists: "အသုံးပြုသူအမည်ရှိပြီးသားဖြစ်သည်",
    emailExists: "အီးမေးလ်ရှိပြီးသားဖြစ်သည်",
    invalidCredentials: "အီးမေးလ် သို့မဟုတ် စကားဝှက်မမှန်ကန်ပါ",
    fillAllFields: "အကွက်များအားလုံးကိုဖြည့်ပေးပါ",
  },
}

export type Language = "en" | "mm"

export const useTranslation = (lang: Language = "en") => {
  return {
    t: (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key],
    lang,
  }
}

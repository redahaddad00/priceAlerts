'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Landing
    welcome: "Welcome back! Please enter your details.",
    join_thousands: "Join thousands of deal hunters today.",
    email: "Email Address",
    password: "Password",
    sign_in: "Access Dashboard",
    create_account: "Create Free Account",
    new_to: "New to PriceAlert?",
    sign_up_free: "Sign up for free",
    already_tracking: "Already tracking?",
    login_here: "Log in here",
    smartest_way: "The smartest way to track deals online.",
    
    // Sidebar
    overview: "Overview",
    trends: "Price Trends",
    billing: "Billing",
    settings: "Settings",
    sign_out: "Sign Out",
    dashboard: "Dashboard",
    
    // Dashboard Home
    welcome_back: "Welcome back,",
    my_products: "My Tracked Products",
    monitoring: "You are currently monitoring",
    items: "items",
    paste_url: "Paste Amazon, eBay, or any product URL...",
    start_tracking: "Start Tracking",
    market_tracking: "Market Tracking",
    current_price: "Current Price",
    status: "Status",
    view_store: "View Store",
    last_checked: "Last checked",
    vault_empty: "Your vault is empty",
    add_first: "Add your first product URL above to start receiving price drop alerts instantly.",
    
    // Billing
    choose_power: "Choose Your Power",
    scale_potential: "Scale your deal-hunting potential with our flexible plans.",
    active_plan: "Active Plan",
    free_tier: "Free Tier",
    most_popular: "MOST POPULAR",
    go_basic: "Go Basic",
    go_pro: "Go Professional",
    secure_payments: "Secure Payments via Stripe",
    encryption: "256-bit Encryption",
    
    // Settings
    account_settings: "Account Settings",
    manage_profile: "Manage your profile, notifications, and security.",
    profile_alerts: "Profile & Alerts",
    security: "Security",
    notifications: "Notifications",
    telegram_integration: "Telegram Integration",
    find_my_id: "Find my ID",
    telegram_placeholder: "e.g. 123456789",
    save_changes: "Save Changes"
  },
  ar: {
    // Landing
    welcome: "مرحباً بعودتك! يرجى إدخال بياناتك.",
    join_thousands: "انضم إلى آلاف الباحثين عن الصفقات اليوم.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    sign_in: "دخول لوحة التحكم",
    create_account: "إنشاء حساب مجاني",
    new_to: "جديد في PriceAlert؟",
    sign_up_free: "اشترك مجاناً",
    already_tracking: "لديك حساب بالفعل؟",
    login_here: "سجل دخولك من هنا",
    smartest_way: "الطريقة الأذكى لتتبع الصفقات عبر الإنترنت.",
    
    // Sidebar
    overview: "نظرة عامة",
    trends: "اتجاهات الأسعار",
    billing: "الفواتير",
    settings: "الإعدادات",
    sign_out: "تسجيل الخروج",
    dashboard: "لوحة التحكم",
    
    // Dashboard Home
    welcome_back: "مرحباً بعودتك،",
    my_products: "منتجاتي المتتبعة",
    monitoring: "أنت تتابع حالياً",
    items: "منتجات",
    paste_url: "الصق رابط المنتج من أمازون، إيباي، أو أي موقع آخر...",
    start_tracking: "ابدأ التتبع",
    market_tracking: "تتبع السوق",
    current_price: "السعر الحالي",
    status: "الحالة",
    view_store: "عرض المتجر",
    last_checked: "آخر فحص",
    vault_empty: "قائمة التتبع فارغة",
    add_first: "أضف أول رابط منتج أعلاه لبدء تلقي تنبيهات انخفاض الأسعار فوراً.",
    
    // Billing
    choose_power: "اختر قوتك",
    scale_potential: "ضاعف إمكانيات صيدك للصفقات مع خططنا المرنة.",
    active_plan: "الخطة النشطة",
    free_tier: "الفئة المجانية",
    most_popular: "الأكثر شيوعاً",
    go_basic: "اشترك في الخطة الأساسية",
    go_pro: "اشترك في الخطة الاحترافية",
    secure_payments: "مدفوعات آمنة عبر Stripe",
    encryption: "تشفير 256 بت",
    
    // Settings
    account_settings: "إعدادات الحساب",
    manage_profile: "إدارة ملفك الشخصي، التنبيهات، والأمان.",
    profile_alerts: "الملف الشخصي والتنبيهات",
    security: "الأمان",
    notifications: "الإشعارات",
    telegram_integration: "تكامل التليجرام",
    find_my_id: "ابحث عن معرفي",
    telegram_placeholder: "مثال: 123456789",
    save_changes: "حفظ التغييرات"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

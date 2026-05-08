'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { CheckCircle2, Zap, Rocket, ShieldCheck, CreditCard } from 'lucide-react';

export default function Billing() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'BASIC' | 'PRO') => {
    setLoading(plan);
    try {
      const res = await fetch('http://localhost:5000/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">{t('choose_power')}</h1>
        <p className="text-xl text-[var(--muted)] font-medium max-w-2xl mx-auto">
          {t('scale_potential')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FREE PLAN */}
        <div className="glass-card rounded-[40px] p-10 flex flex-col border border-[var(--border)] transition-all hover:scale-[1.02] text-start">
          <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8">
            <Zap className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-2xl font-black mb-2 tracking-tight">{language === 'ar' ? 'مجاني' : 'Free'}</h3>
          <p className="text-[var(--muted)] mb-8 text-sm font-medium">{language === 'ar' ? 'مثالي للمتسوقين العاديين.' : 'Perfect for casual shoppers.'}</p>
          <div className="mb-8">
            <span className="text-5xl font-black tracking-tighter">$0</span>
            <span className="text-[var(--muted)] font-bold text-lg">/{language === 'ar' ? 'شهر' : 'mo'}</span>
          </div>
          <ul className="space-y-5 mb-10 flex-1">
            <li className="flex items-center text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-[var(--success)] mr-4 rtl:ml-4 rtl:mr-0" />
              {language === 'ar' ? 'تتبع حتى 3 منتجات' : 'Track up to 3 products'}
            </li>
            <li className="flex items-center text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-[var(--success)] mr-4 rtl:ml-4 rtl:mr-0" />
              {language === 'ar' ? 'تحديث كل 5 دقائق' : '5min refresh interval'}
            </li>
          </ul>
          <button disabled className="w-full py-5 bg-[var(--background)] text-[var(--muted)] rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed border border-[var(--border)]">
            {user?.plan === 'FREE' ? t('active_plan') : t('free_tier')}
          </button>
        </div>

        {/* BASIC PLAN */}
        <div className="bg-[var(--primary)] rounded-[40px] p-10 flex flex-col relative transform scale-105 z-10 text-white shadow-2xl shadow-blue-500/40 text-start">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-6 py-2 rounded-full tracking-widest uppercase shadow-lg whitespace-nowrap">{t('most_popular')}</div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-black mb-2 tracking-tight">{language === 'ar' ? 'أساسي' : 'Basic'}</h3>
          <p className="text-blue-100 mb-8 text-sm font-medium">{language === 'ar' ? 'للباحثين الجادين عن الصفقات.' : 'For serious bargain hunters.'}</p>
          <div className="mb-8">
            <span className="text-5xl font-black tracking-tighter">$5</span>
            <span className="text-blue-100 font-bold text-lg">/{language === 'ar' ? 'شهر' : 'mo'}</span>
          </div>
          <ul className="space-y-5 mb-10 flex-1">
            <li className="flex items-center text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-white mr-4 rtl:ml-4 rtl:mr-0" />
              {language === 'ar' ? 'تتبع حتى 50 منتج' : 'Track up to 50 products'}
            </li>
            <li className="flex items-center text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-white mr-4 rtl:ml-4 rtl:mr-0" />
              {language === 'ar' ? 'تنبيهات تليجرام فورية' : 'Instant Telegram Alerts'}
            </li>
          </ul>
          <button 
            onClick={() => handleSubscribe('BASIC')}
            disabled={loading !== null}
            className="w-full py-5 bg-white text-[var(--primary)] hover:scale-105 active:scale-95 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl"
          >
            {loading === 'BASIC' ? '...' : user?.plan === 'BASIC' ? t('active_plan') : t('go_basic')}
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="glass-card rounded-[40px] p-10 flex flex-col border border-[var(--border)] transition-all hover:scale-[1.02] text-start">
          <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8">
            <ShieldCheck className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-2xl font-black mb-2 tracking-tight">{language === 'ar' ? 'احترافي' : 'Pro'}</h3>
          <p className="text-[var(--muted)] mb-8 text-sm font-medium">{language === 'ar' ? 'تتبع غير محدود للخبراء.' : 'Unlimited tracking for experts.'}</p>
          <div className="mb-8">
            <span className="text-5xl font-black tracking-tighter">$15</span>
            <span className="text-[var(--muted)] font-bold text-lg">/{language === 'ar' ? 'شهر' : 'mo'}</span>
          </div>
          <ul className="space-y-5 mb-10 flex-1">
            <li className="flex items-center text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-[var(--success)] mr-4 rtl:ml-4 rtl:mr-0" />
              {language === 'ar' ? 'تتبع غير محدود' : 'Unlimited tracking'}
            </li>
            <li className="flex items-center text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-[var(--success)] mr-4 rtl:ml-4 rtl:mr-0" />
              {language === 'ar' ? 'مزامنة حقيقية للسوق' : 'Real-time Market Sync'}
            </li>
          </ul>
          <button 
            onClick={() => handleSubscribe('PRO')}
            disabled={loading !== null}
            className="w-full py-5 bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] hover:bg-opacity-20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-[var(--primary)] border-opacity-20"
          >
            {loading === 'PRO' ? '...' : user?.plan === 'PRO' ? t('active_plan') : t('go_pro')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse pt-12 border-t border-[var(--border)] border-opacity-50">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-[var(--muted)]">
          <CreditCard className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('secure_payments')}</span>
        </div>
        <div className="w-1.5 h-1.5 bg-[var(--border)] rounded-full"></div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-[var(--muted)]">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('encryption')}</span>
        </div>
      </div>
    </div>
  );
}

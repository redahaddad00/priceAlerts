'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { 
  Send, 
  Save, 
  User as UserIcon, 
  Bell, 
  CheckCircle2, 
  Shield, 
  Smartphone,
  ExternalLink
} from 'lucide-react';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { t, language } = useLanguage();
  const [telegramChatId, setTelegramChatId] = useState(user?.telegramChatId || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ telegramChatId })
      });

      const data = await res.json();

      if (res.ok) {
        setUser({ ...user!, telegramChatId: data.telegramChatId });
        setMessage({ type: 'success', text: language === 'ar' ? 'تم تحديث الإعدادات بنجاح!' : 'Settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || (language === 'ar' ? 'فشل التحديث' : 'Failed to update') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: language === 'ar' ? 'خطأ في الاتصال' : 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="mb-8 text-start">
        <h1 className="text-4xl font-black tracking-tighter mb-2">{t('account_settings')}</h1>
        <p className="text-[var(--muted)] font-medium">{t('manage_profile')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center space-x-3 rtl:space-x-reverse px-5 py-4 rounded-2xl bg-[var(--primary)] text-white shadow-lg shadow-blue-500/20 font-bold text-sm">
            <UserIcon className="w-5 h-5" />
            <span>{t('profile_alerts')}</span>
          </button>
          <button className="w-full flex items-center space-x-3 rtl:space-x-reverse px-5 py-4 rounded-2xl text-[var(--muted)] hover:bg-[var(--primary)] hover:bg-opacity-5 transition-all font-bold text-sm">
            <Shield className="w-5 h-5" />
            <span>{t('security')}</span>
          </button>
          <button className="w-full flex items-center space-x-3 rtl:space-x-reverse px-5 py-4 rounded-2xl text-[var(--muted)] hover:bg-[var(--primary)] hover:bg-opacity-5 transition-all font-bold text-sm">
            <Bell className="w-5 h-5" />
            <span>{t('notifications')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Card */}
          <div className="glass-card rounded-[32px] p-8 border border-[var(--border)]">
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-8">
              <div className="w-16 h-16 bg-[var(--primary)] bg-opacity-10 rounded-2xl flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <div className="text-start">
                <h3 className="text-xl font-black tracking-tight">{user?.email}</h3>
                <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">{user?.plan} {language === 'ar' ? 'عضوية' : 'Membership'}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Smartphone className="w-5 h-5 text-[var(--primary)]" />
                    <h4 className="font-black tracking-tight">{t('telegram_integration')}</h4>
                  </div>
                  <a 
                    href="https://t.me/userinfobot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] text-[10px] font-black uppercase tracking-widest flex items-center hover:underline"
                  >
                    {t('find_my_id')} <ExternalLink className="w-3 h-3 ml-1 rtl:mr-1" />
                  </a>
                </div>
                
                <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] text-start">
                  <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest block mb-2 ml-1 rtl:mr-1">Telegram Chat ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-4 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all font-bold"
                      placeholder={t('telegram_placeholder')}
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                    />
                    <div className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                      <Send className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-[var(--muted)] font-medium leading-relaxed">
                    {language === 'ar' 
                      ? 'أدخل معرف تليجرام الخاص بك لتلقي تنبيهات فورية. يمكنك الحصول عليه بمراسلة @userinfobot.' 
                      : 'Enter your Telegram Chat ID to receive instant price drop alerts. You can get this by messaging @userinfobot.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {message.text && (
                  <div className={`flex items-center text-xs font-bold ${message.type === 'success' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    <CheckCircle2 className="w-4 h-4 mr-2 rtl:ml-2" />
                    {message.text}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto rtl:ml-0 rtl:mr-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center space-x-2 rtl:space-x-reverse btn-premium disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t('save_changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

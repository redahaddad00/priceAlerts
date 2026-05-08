'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { Moon, Sun, AlertCircle, Languages, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (authMode === 'forgot') {
      // Mock forgot password
      setTimeout(() => {
        setSuccess(language === 'ar' ? 'تم إرسال تعليمات استعادة كلمة المرور لبريدك!' : 'Password reset instructions sent to your email!');
        setLoading(false);
      }, 1500);
      return;
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error');

      login(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400 opacity-10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="absolute top-8 right-8 z-50 flex space-x-4 rtl:space-x-reverse animate-fade-in">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="p-3 rounded-2xl glass-card hover:scale-110 transition-all active:scale-95 group flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Languages className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <span className="text-[10px] font-black uppercase tracking-widest">{language === 'en' ? 'AR' : 'EN'}</span>
        </button>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl glass-card hover:scale-110 transition-all active:scale-95 group"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-yellow-400" />}
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        {/* Left Side: Value Proposition */}
        <div className="hidden lg:flex flex-col space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30 rotate-3">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter leading-none">
              {language === 'ar' ? 'تتبع الصفقات كالمحترفين' : 'Track Deals Like a Pro.'}
            </h1>
            <p className="text-xl text-[var(--muted)] font-medium max-w-md leading-relaxed">
              {t('smartest_way')} {language === 'ar' ? 'ابدأ تتبع منتجاتك المفضلة الآن ووفر أموالك.' : 'Start monitoring your favorite products and save money instantly.'}
            </p>
          </div>
          
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-8 py-5 bg-[var(--primary)] text-white font-black rounded-[20px] shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center group btn-premium"
            >
              <span>{language === 'ar' ? 'جرب الآن مجاناً' : 'Try Now for Free'}</span>
              <ArrowRight className="w-5 h-5 ml-3 rtl:mr-3 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--background)] bg-gray-200 overflow-hidden shadow-md">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[var(--background)] bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-md">+2k</div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-[440px] glass-card rounded-[40px] p-10 animate-fade-in shadow-2xl border border-[var(--glass-border)]">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tighter mb-2">
                {authMode === 'login' ? t('welcome_back') : authMode === 'signup' ? t('create_account') : t('security')}
              </h2>
              <p className="text-[var(--muted)] text-sm font-medium opacity-80">
                {authMode === 'forgot' ? (language === 'ar' ? 'أدخل بريدك لاستعادة الوصول' : 'Enter email to regain access') : t('smartest_way')}
              </p>
            </div>

            {(error || success) && (
              <div className={`mb-8 p-4 rounded-2xl border flex items-center text-xs font-bold animate-fade-in ${
                error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              }`}>
                {error ? <AlertCircle className="w-4 h-4 mr-3 rtl:ml-3" /> : <CheckCircle2 className="w-4 h-4 mr-3 rtl:ml-3" />}
                {error || success}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2 text-start">
                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] ml-1 rtl:mr-1">{t('email')}</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all placeholder:text-[var(--muted)] placeholder:opacity-50 font-bold"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {authMode !== 'forgot' && (
                <div className="space-y-2 text-start">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">{t('password')}</label>
                    {authMode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest hover:underline"
                      >
                        {language === 'ar' ? 'نسيت؟' : 'Forgot?'}
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all placeholder:text-[var(--muted)] placeholder:opacity-50 font-bold"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black py-5 rounded-2xl transition-all flex justify-center items-center shadow-xl shadow-blue-500/20 btn-premium disabled:opacity-50 active:scale-[0.98] text-sm tracking-wide"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  authMode === 'login' ? t('sign_in') : authMode === 'signup' ? t('create_account') : (language === 'ar' ? 'إرسال' : 'Send Reset Link')
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-[var(--border)] text-center">
              <p className="text-sm text-[var(--muted)] font-medium">
                {authMode === 'login' ? t('new_to') : (language === 'ar' ? 'تذكرتها؟' : 'Remembered?')}
                <button
                  onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  className="text-[var(--primary)] hover:underline font-bold transition-all mx-2"
                >
                  {authMode === 'login' ? t('sign_up_free') : t('login_here')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

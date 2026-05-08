'use client';

import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Moon, Sun, User, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 lg:h-20 glass-card border-b border-[var(--border)] flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="text-start pl-14 lg:pl-0 rtl:pl-0 rtl:pr-14 lg:rtl:pr-0">
            <h2 className="text-[10px] lg:text-sm font-bold text-[var(--muted)] uppercase tracking-[0.2em]">{!user ? (language === 'ar' ? 'وضع التجربة' : 'Trial Mode') : t('dashboard')}</h2>
            <p className="text-sm lg:text-lg font-black tracking-tight">{!user ? (language === 'ar' ? 'أهلاً بك!' : 'Welcome!') : `${t('welcome_back')} ${user.email.split('@')[0]}!`}</p>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-6 rtl:space-x-reverse">
            <button className="p-2.5 rounded-xl hover:bg-[var(--primary)] hover:bg-opacity-10 transition-all text-[var(--muted)] relative">
              <Bell className="w-5 h-5" />
              {user && <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--danger)] rounded-full border-2 border-[var(--card)]"></span>}
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl glass-card hover:scale-105 transition-all active:scale-95 text-[var(--foreground)]"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <div className="h-8 w-[1px] bg-[var(--border)] mx-2"></div>

            {user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse group cursor-pointer">
                <div className="text-right rtl:text-left">
                  <p className="text-sm font-bold truncate max-w-[120px]">{user.email}</p>
                  <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">{user.plan} {language === 'ar' ? 'خطة' : 'PLAN'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner overflow-hidden border border-[var(--border)]">
                  <User className="w-6 h-6 text-[var(--muted)]" />
                </div>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
              >
                {t('sign_in')}
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

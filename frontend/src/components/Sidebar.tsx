'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LayoutDashboard, CreditCard, Settings, LogOut, Menu, X, TrendingUp, Languages } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: t('overview'), icon: LayoutDashboard, path: '/dashboard' },
    { name: t('trends'), icon: TrendingUp, path: '/dashboard/trends' },
    { name: t('billing'), icon: CreditCard, path: '/dashboard/billing' },
    { name: t('settings'), icon: Settings, path: '/dashboard/settings' },
  ];

  const NavContent = () => (
    <>
      <div className="p-8 mb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-300">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">PriceAlert</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-4 rtl:space-x-reverse px-5 py-4 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-lg shadow-blue-500/25'
                  : 'text-[var(--muted)] hover:bg-[var(--primary)] hover:bg-opacity-10 hover:text-[var(--primary)]'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="font-bold text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto space-y-2 border-t border-[var(--border)] border-opacity-50">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center space-x-4 rtl:space-x-reverse px-5 py-4 w-full rounded-2xl text-[var(--muted)] hover:bg-[var(--primary)] hover:bg-opacity-10 transition-all group font-bold text-sm"
        >
          <Languages className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        <button
          onClick={logout}
          className="flex items-center space-x-4 rtl:space-x-reverse px-5 py-4 w-full rounded-2xl text-[var(--danger)] hover:bg-red-500 hover:bg-opacity-10 transition-all group font-bold text-sm"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          <span>{t('sign_out')}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 glass-card rounded-xl border border-[var(--border)]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={`hidden lg:flex w-72 glass-card border-r border-[var(--border)] flex-col h-screen transition-all z-20`}>
        <NavContent />
      </aside>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-[40]" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 h-screen w-72 glass-card border-r border-[var(--border)] flex flex-col z-[50] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavContent />
      </aside>
    </>
  );
}

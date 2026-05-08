'use client';

import { TrendingUp, BarChart3, Clock } from 'lucide-react';

export default function Trends() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
      <div className="relative">
        <div className="w-32 h-32 bg-blue-500/10 rounded-[40px] flex items-center justify-center rotate-12">
          <BarChart3 className="w-16 h-16 text-blue-500 opacity-40" />
        </div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[var(--card)] glass-card rounded-2xl flex items-center justify-center shadow-xl">
          <Clock className="w-8 h-8 text-[var(--primary)]" />
        </div>
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black tracking-tighter">Advanced Analytics</h1>
        <p className="text-[var(--muted)] font-medium max-w-md mx-auto">
          We are currently building advanced price prediction and market analytics. 
          Stay tuned for real-time market trends!
        </p>
      </div>

      <div className="flex items-center space-x-2 px-6 py-3 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest">
        <TrendingUp className="w-4 h-4" />
        <span>Coming Soon in Q3 2026</span>
      </div>
    </div>
  );
}

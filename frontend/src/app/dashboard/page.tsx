'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  AlertCircle,
  Clock,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  Filter,
  Layers
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';

interface Product {
  _id: string;
  name: string;
  url: string;
  currentPrice: number;
  previousPrice: number;
  status: 'UP' | 'DOWN' | 'SAME' | 'NEW';
  priceHistory: { price: number; timestamp: string }[];
  lastCheckedAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeBrand, setActiveBrand] = useState('All');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const isGuest = !user;
  const productRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (isGuest) {
      const guestProducts = JSON.parse(localStorage.getItem('guest_products') || '[]');
      setProducts(guestProducts);
      setFetching(false);
    } else {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const getBrandName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      const brand = parts.length > 2 ? parts[parts.length - 2] : parts[0];
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    } catch {
      return 'Other';
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Duplicate Check
    const existing = products.find(p => p.url === url);
    if (existing) {
      setMessage({ type: 'error', text: language === 'ar' ? 'هذا المنتج موجود بالفعل في قائمتك!' : 'This product is already in your list!' });
      setHighlightedId(existing._id);
      setActiveBrand('All');
      productRefs.current[existing._id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHighlightedId(null), 3000);
      return;
    }

    if (isGuest && products.length >= 3) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    if (isGuest) {
      try {
        const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
        const scraped = await res.json();
        
        if (!scraped || scraped.price === null) {
          setMessage({ type: 'error', text: language === 'ar' ? 'عذراً، لم نتمكن من جلب السعر. تأكد من الرابط.' : 'Sorry, could not fetch price. Check the URL.' });
          setLoading(false);
          return;
        }

        const newProduct: Product = {
          _id: Math.random().toString(),
          name: scraped.name || getBrandName(url) + ' Product',
          url,
          currentPrice: scraped.price,
          previousPrice: scraped.price,
          status: 'NEW',
          priceHistory: [
            { price: scraped.price, timestamp: new Date().toISOString() }
          ],
          lastCheckedAt: new Date().toISOString()
        };

        const updated = [newProduct, ...products];
        setProducts(updated);
        localStorage.setItem('guest_products', JSON.stringify(updated));
        setUrl('');
        setMessage({ type: 'success', text: language === 'ar' ? 'تم الجلب بنجاح! سجل لحفظ المنتج.' : 'Fetched successfully! Register to save.' });
      } catch (err: any) {
        setMessage({ 
          type: 'error', 
          text: language === 'ar' 
            ? 'فشل الاتصال بالسيرفر. تأكد من تشغيل الـ Backend.' 
            : 'Server connection failed. Make sure Backend is running.' 
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) {
        setProducts([data, ...products]);
        setUrl('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Error' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to remove this product?')) return;
    
    if (isGuest) {
      setLoading(true); // Small feedback
      setTimeout(() => {
        const updated = products.filter(p => p._id !== id);
        setProducts(updated);
        localStorage.setItem('guest_products', JSON.stringify(updated));
        setLoading(false);
        setMessage({ type: 'success', text: language === 'ar' ? 'تم الحذف بنجاح' : 'Product removed successfully' });
      }, 500);
      return;
    }
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        setMessage({ type: 'success', text: language === 'ar' ? 'تم الحذف من حسابك' : 'Removed from your account' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Failed to delete' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  // Grouping products by brand
  const brands = ['All', ...Array.from(new Set(products.map(p => getBrandName(p.url))))];
  const filteredProducts = activeBrand === 'All' 
    ? products 
    : products.filter(p => getBrandName(p.url) === activeBrand);

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[var(--muted)] animate-pulse uppercase tracking-widest">{t('last_checked')}...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 relative">
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-[40px] p-10 text-center space-y-6 shadow-2xl border border-white/20">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/30 rotate-12">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter">{language === 'ar' ? 'وصلت للحد الأقصى!' : 'Limit Reached!'}</h3>
            <p className="text-[var(--muted)] font-medium">{language === 'ar' ? 'سجل الآن لتتبع المزيد!' : 'Register now to track more items!'}</p>
            <button onClick={() => router.push('/')} className="w-full py-4 bg-[var(--primary)] text-white font-black rounded-2xl flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-xl btn-premium">
              <span>{language === 'ar' ? 'سجل حسابك الآن' : 'Create Account Now'}</span>
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-4 text-[var(--muted)] font-bold">{language === 'ar' ? 'ربما لاحقاً' : 'Maybe Later'}</button>
          </div>
        </div>
      )}

      {/* Header & Add Form */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-start">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
            <h1 className="text-4xl font-black tracking-tighter">{t('my_products')}</h1>
            {isGuest && <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20">{language === 'ar' ? 'وضع التجربة' : 'Trial Mode'}</span>}
          </div>
          <p className="text-[var(--muted)] font-medium">{isGuest ? (language === 'ar' ? `استخدمت ${products.length} من 3.` : `Used ${products.length} of 3.`) : `${t('monitoring')} ${products.length} ${t('items')}.`}</p>
        </div>

        <form onSubmit={handleAddProduct} className="flex-1 max-w-xl group">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 rtl:left-auto rtl:right-4 flex items-center pointer-events-none text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <input
              type="url"
              placeholder={t('paste_url')}
              className="w-full pl-12 rtl:pl-32 rtl:pr-12 pr-32 py-4 glass-card border-[var(--border)] rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 rtl:right-auto rtl:left-2 top-2 bottom-2 px-6 bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 btn-premium"
            >
              {loading ? '...' : t('start_tracking')}
            </button>
          </div>
          {message.text && (
            <div className={`mt-3 p-3 rounded-xl border flex items-center text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500 animate-shake'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-3 h-3 mr-2 rtl:ml-2" /> : <AlertCircle className="w-3 h-3 mr-2 rtl:ml-2" />}
              {message.text}
            </div>
          )}
        </form>
      </div>

      {/* Brands Tabs */}
      {products.length > 0 && (
        <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 scrollbar-hide">
          <div className="p-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex space-x-1 rtl:space-x-reverse">
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => setActiveBrand(brand)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeBrand === brand 
                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-blue-500/20' 
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                }`}
              >
                {brand === 'All' ? (language === 'ar' ? 'الكل' : 'All') : brand}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-4 rtl:mr-4">
            <Filter className="w-3 h-3 mr-1 rtl:ml-1" />
            {language === 'ar' ? 'تصفية حسب المتجر' : 'Filter by Store'}
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 glass-card rounded-[40px] border-dashed border-2">
          <div className="w-24 h-24 bg-[var(--primary)] bg-opacity-5 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-[var(--primary)] opacity-40" />
          </div>
          <h3 className="text-xl font-black mb-2 tracking-tight">{t('vault_empty')}</h3>
          <p className="text-[var(--muted)] font-medium max-w-sm text-center">{t('add_first')}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-[var(--primary)] bg-opacity-5 rounded-3xl flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-[var(--primary)] opacity-40" />
          </div>
          <p className="text-[var(--muted)] font-bold">{language === 'ar' ? 'لا توجد منتجات لهذا المتجر بعد.' : 'No products for this store yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredProducts.map((product) => (
            <div 
              key={product._id} 
              ref={el => productRefs.current[product._id] = el}
              className={`glass-card rounded-[32px] overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 ${
                highlightedId === product._id ? 'border-[var(--primary)] scale-[1.02] shadow-2xl' : 'border-[var(--border)]'
              }`}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-4 rtl:pr-0 rtl:pl-4 text-start">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20">
                        {getBrandName(product.url)}
                      </span>
                      {product.status === 'DOWN' && (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center">
                          <TrendingDown className="w-3 h-3 mr-1 rtl:ml-1" /> {language === 'ar' ? 'هبوط' : 'Drop'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black tracking-tight line-clamp-1 group-hover:text-[var(--primary)] transition-colors">{product.name}</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProduct(product._id);
                    }} 
                    className="p-2.5 text-[var(--muted)] hover:text-[var(--danger)] hover:bg-red-500/10 rounded-xl transition-all relative z-10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] text-start shadow-sm">
                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">{t('current_price')}</p>
                    <p className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                      {product.currentPrice?.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-EG')} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  </div>
                  <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] text-start shadow-sm">
                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">{t('status')}</p>
                    <div className="flex items-center">
                      {product.status === 'UP' && <TrendingUp className="text-[var(--danger)] w-5 h-5 mr-2 rtl:ml-2" />}
                      {product.status === 'DOWN' && <TrendingDown className="text-[var(--success)] w-5 h-5 mr-2 rtl:ml-2" />}
                      {product.status === 'SAME' && <Minus className="text-[var(--muted)] w-5 h-5 mr-2 rtl:ml-2" />}
                      {product.status === 'NEW' && <Plus className="text-[var(--primary)] w-5 h-5 mr-2 rtl:ml-2" />}
                      <span className={`font-black text-sm uppercase tracking-wider ${product.status === 'UP' ? 'text-[var(--danger)]' : product.status === 'DOWN' ? 'text-[var(--success)]' : 'text-[var(--muted)]'}`}>{product.status}</span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-40 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={product.priceHistory}>
                      <defs>
                        <linearGradient id={`colorPrice-${product._id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} /><XAxis hide dataKey="timestamp" /><YAxis hide domain={['auto', 'auto']} /><Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: '800' }} labelClassName="hidden" /><Area type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill={`url(#colorPrice-${product._id})`} animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                  <div className="flex items-center text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest"><Clock className="w-3 h-3 mr-2 rtl:ml-2" />{t('last_checked')}: {new Date(product.lastCheckedAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'})}</div>
                  <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 rtl:space-x-reverse text-[var(--primary)] font-black text-xs uppercase tracking-widest hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform"><span>{t('view_store')}</span><ExternalLink className="w-4 h-4" /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

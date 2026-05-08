'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const isGuest = searchParams.get('guest') === 'true';
  const [url, setUrl] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  useEffect(() => {
    if (isGuest) {
      const saved = localStorage.getItem('guest_products');
      if (saved) setProducts(JSON.parse(saved));
    }
  }, [isGuest]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      const scraped = await res.json();
      
      if (!res.ok || !scraped.price) {
        setMessage({ type: 'error', text: 'Could not find price on this page.' });
      } else {
        const newProduct = {
          _id: Date.now().toString(),
          name: scraped.name,
          currentPrice: scraped.price,
          url: url,
          image: '/file.svg'
        };
        const updated = [newProduct, ...products];
        setProducts(updated);
        if (isGuest) localStorage.setItem('guest_products', JSON.stringify(updated));
        setUrl('');
        setMessage({ type: 'success', text: 'Product added successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = (id: string) => {
    const updated = products.filter(p => p._id !== id);
    setProducts(updated);
    if (isGuest) localStorage.setItem('guest_products', JSON.stringify(updated));
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Monitoring List</h1>
          <p className="text-gray-400">Track and get alerts for price changes</p>
        </div>
        {isGuest && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-lg flex items-center gap-2 text-yellow-200 text-sm">
            <AlertCircle size={18} />
            Guest Mode: Data is saved locally in your browser.
          </div>
        )}
      </div>

      <form onSubmit={handleAddProduct} className="mb-12">
        <div className="flex gap-2">
          <input 
            type="url" 
            placeholder="Paste product link here..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Plus />}
            <span className="hidden sm:inline">{loading ? 'Searching...' : 'Add Product'}</span>
          </button>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {message.text}
          </p>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                <img src={product.image} alt="product" className="w-8 h-8 opacity-50" />
              </div>
              <button 
                onClick={() => removeProduct(product._id)}
                className="text-gray-500 hover:text-red-400 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <h3 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Price</p>
                <p className="text-2xl font-bold text-white">{product.currentPrice} <span className="text-sm text-gray-500 font-normal">EGP</span></p>
              </div>
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-gray-300"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-700">
          <p className="text-gray-500">No products added yet. Start by pasting a link above!</p>
        </div>
      )}
    </div>
  );
}

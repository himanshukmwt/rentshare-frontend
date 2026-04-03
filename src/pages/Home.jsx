import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getItems, searchItems, filterItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';

/* ─── Skeleton ─────────────────────────────────────────── */
const SkeletonCard = ({ i }) => (
  <div
    className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
    style={{ animationDelay: `${i * 80}ms` }}
  >
    <div className="h-52 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

/* ─── Stat ──────────────────────────────────────────────── */
const Stat = ({ value, label }) => (
  <div className="flex flex-col items-center gap-1 px-8">
    <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
    <span className="text-xs uppercase tracking-widest text-blue-200 font-medium">{label}</span>
  </div>
);

/* ─── Home ──────────────────────────────────────────────── */
const Home = () => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems((await getItems()).data); }
    catch { setError('Failed to load items. Please check your connection and try again.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSearch = async (q) => {
    if (!q.trim()) return fetchItems();
    setLoading(true); setError('');
    try { setItems((await searchItems(q.trim())).data); }
    catch { setError('Search failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleFilter = async (filters) => {
    if (!filters.category && !filters.maxPrice && !filters.city) return fetchItems();
    setLoading(true); setError('');
    try { setItems((await filterItems(filters)).data); }
    catch { setError('Filter failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

        .font-display { font-family: 'DM Serif Display', Georgia, serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        .hero-fade-in {
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .card-hover {
          transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(37,99,235,0.15), 0 0 0 1px rgba(99,102,241,0.15);
        }

        .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.2); }

        .marquee-track {
          display: flex;
          gap: 2.5rem;
          animation: marquee 24s linear infinite;
          white-space: nowrap;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .hero-noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        .search-float {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(37,99,235,0.12), 0 0 0 1px rgba(99,102,241,0.08);
          padding: 12px;
        }
      `}</style>

      <div className="font-body min-h-screen bg-gray-50">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden hero-noise bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-24 pb-0">

          {/* Decorative blobs */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 text-center">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 hero-fade-in"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#e0eaff', animationDelay: '0ms' }}
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Peer-to-peer rental marketplace
            </div>

            {/* Headline */}
            <h1
              className="font-display text-5xl md:text-7xl text-white mb-5 hero-fade-in"
              style={{ lineHeight: '1.08', letterSpacing: '-0.01em', animationDelay: '100ms' }}
            >
              Rent Anything,
              <br />
              <span className="text-blue-200">Share Everything</span>
            </h1>

            {/* Subheading */}
            <p
              className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto hero-fade-in"
              style={{ lineHeight: '1.7', animationDelay: '200ms' }}
            >
              Borrow items from people near you. Save money, reduce waste, build community.
            </p>

            {/* CTAs */}
            <div
              className="flex items-center justify-center gap-4 flex-wrap hero-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                to="/add-item"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                List Your Item
              </Link>
              <a
                href="#items"
                className="px-6 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
              >
                Browse Items
              </a>
            </div>

            {/* Stats */}
            <div
              className="inline-flex items-center mt-14 rounded-2xl px-4 py-4 hero-fade-in"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', animationDelay: '400ms' }}
            >
              <Stat value={loading ? '…' : items.length || '0'} label="Items Listed" />
              <div className="stat-divider" />
              <Stat value="15+" label="Categories" />
              <div className="stat-divider" />
              <Stat value="100%" label="Secure" />
            </div>
          </div>

          {/* Marquee strip */}
          <div className="border-t overflow-hidden py-3.5 select-none"
               style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)' }}>
            <div className="marquee-track text-xs uppercase tracking-[0.2em]"
                 style={{ color: 'rgba(255,255,255,0.3)' }}>
              {Array.from({ length: 2 }).flatMap(() =>
                ['Camera Equipment','Power Tools','Camping Gear','Musical Instruments',
                 'Sports Equipment','Party Supplies','Electronics','Garden Tools',
                 'Books','Photography'].map(t => (
                  <span key={Math.random()} className="flex items-center gap-4">
                    <span style={{ color: '#93c5fd', fontSize: 8 }}>◆</span> {t}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div id="items" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Search */}
          <div className="search-float mb-8 -mt-6 relative z-10">
            <SearchBar onSearch={handleSearch} onFilter={handleFilter} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
              {error}
              <button onClick={fetchItems} className="ml-auto text-red-600 hover:text-red-800 font-semibold underline text-xs">Retry</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} i={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-9 h-9 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="font-display text-2xl text-gray-800 mb-2">No items found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or be the first to list an item!</p>
              <Link to="/add-item" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all">
                List an Item
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-gray-900">
                  Available Items{' '}
                  <span className="font-body text-base font-normal text-gray-400">({items.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="card-hover bg-white rounded-2xl overflow-hidden border border-gray-100"
                    style={{
                      opacity: 0,
                      animation: `fadeUp 0.5s cubic-bezier(.22,1,.36,1) ${i * 50}ms forwards`,
                    }}
                  >
                    <ItemCard item={item} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
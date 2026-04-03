import { useEffect, useState, useCallback } from 'react';
import API from '../services/api';

/* ── Category SVG Icons ─────────────────────────────────── */
const CategoryIcon = ({ name, className = 'w-4 h-4' }) => {
  const icons = {
    Books: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
    Tools: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    Electronics: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    Clothing: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
      </svg>
    ),
    Sports: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 9.17l4.24-4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M9.17 14.83l-4.24 4.24"/><circle cx="12" cy="12" r="4"/>
      </svg>
    ),
    Music: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    ),
    Home: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    Vehicles: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    Other: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
    ),
  };
  return icons[name] || icons.Other;
};

const SearchBar = ({ onSearch, onFilter }) => {
  const [query, setQuery]                   = useState('');
  const [maxPrice, setMaxPrice]             = useState('');
  const [categories, setCategories]         = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [city, setCity]                     = useState('');

  useEffect(() => {
    API.get('/categories')
      .then(res => setCategories(res.data.sort()))
      .catch(() => {});
  }, []);

  const handleFilter = useCallback((overrides = {}) => {
    onFilter({ category: selectedCategory, maxPrice, city, ...overrides });
  }, [selectedCategory, maxPrice, city, onFilter]);

  const handleClear = () => {
    setSelectedCategory('');
    setMaxPrice('');
    setCity('');
    onFilter({});
  };

  const hasFilters = selectedCategory || maxPrice || city;

  return (
    <>
      <style>{`
        .sb-input {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          color: #1f2937;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .sb-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .sb-select {
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          color: #374151;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          cursor: pointer;
          appearance: none;
          padding: 9px 32px 9px 36px;
        }
        .sb-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .sb-select-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .sb-select-icon {
          position: absolute;
          left: 10px;
          pointer-events: none;
          color: #9ca3af;
        }
        .sb-select-arrow {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: #9ca3af;
        }
      `}</style>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

        {/* Search row */}
        <form
          onSubmit={(e) => { e.preventDefault(); onSearch(query); }}
          className="flex gap-2 mb-3"
        >
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sb-input pl-10 pr-4 py-2.5"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
          >
            Search
          </button>
        </form>

        {/* Filter row */}
        <div className="flex gap-2.5 flex-wrap items-center">

          {/* Category */}
          <div className="sb-select-wrap">
            <span className="sb-select-icon" style={{ color: selectedCategory ? '#3b82f6' : '#9ca3af' }}>
              <CategoryIcon name={selectedCategory || 'Other'} className="w-3.5 h-3.5" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); handleFilter({ category: e.target.value }); }}
              className="sb-select"
              style={{ borderColor: selectedCategory ? '#3b82f6' : undefined }}
            >
              <option value="">All Categories</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="sb-select-arrow">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </span>
          </div>

          {/* Max Price */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">₹</span>
            <input
              type="number"
              placeholder="Max price/day"
              value={maxPrice}
              min="0"
              onChange={(e) => { setMaxPrice(e.target.value); handleFilter({ maxPrice: e.target.value }); }}
              className="sb-input pl-7 pr-3 py-2.5 w-36"
            />
          </div>

          {/* City */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <input
              type="text"
              placeholder="City..."
              value={city}
              onChange={(e) => { setCity(e.target.value); handleFilter({ city: e.target.value }); }}
              className="sb-input pl-9 pr-3 py-2.5 w-32"
            />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchBar;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyItems, deleteItem } from '../services/api';
import Alert from '../components/Alert';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      const res = await getMyItems();
      setItems(res.data);
    } catch {
      setError('Failed to load items. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteItem(deleteId);
      setItems(prev => prev.filter(i => i.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting item. Please try again.');
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

        .mi-root {
          min-height: 100vh;
          background: #F5F6FA;
          padding-top: 80px;
          font-family: 'Inter', sans-serif;
          background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 60%);
        }

        .mi-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }

        .mi-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 32px;
          animation: fadeUp 0.4s ease forwards;
        }
        .mi-title {
          font-family: 'Inter', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #111827; letter-spacing: -0.5px;
          margin: 0 0 4px;
        }
        .mi-sub { font-size: 14px; color: #9CA3AF; margin: 0; }

        .mi-add-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%);
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.2px;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .mi-add-btn:hover {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
        }

        .mi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          animation: fadeUp 0.4s ease 0.05s both;
        }

        .mi-card {
          background: #fff;
          border: 1px solid #E8EAF0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(99,102,241,0.04);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .mi-card:hover {
          box-shadow: 0 8px 28px rgba(99,102,241,0.1);
          transform: translateY(-2px);
        }

        .mi-img {
          position: relative;
          height: 190px;
          background: #F3F4F6;
          overflow: hidden;
        }
        .mi-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }
        .mi-card:hover .mi-img img { transform: scale(1.03); }

        .mi-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.18) 100%);
          pointer-events: none;
        }

        .mi-body { padding: 16px 18px 18px; }

        .mi-item-name {
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #111827;
          margin: 0 0 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .mi-item-cat {
          font-size: 12px; color: #9CA3AF;
          text-transform: capitalize;
          margin: 0 0 14px;
        }

        .mi-footer {
          display: flex; align-items: center; justify-content: space-between;
        }
        .mi-price {
          font-family: 'Inter', sans-serif;
          font-size: 17px; font-weight: 600;
          color: #4F46E5;
          line-height: 1;
        }
        .mi-price span {
          font-size: 12px; font-weight: 400;
          color: #9CA3AF;
        }

        .mi-actions { display: flex; gap: 4px; }
        .mi-action-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          border: none; background: none; cursor: pointer;
          color: #9CA3AF;
          transition: color 0.15s, background 0.15s;
          text-decoration: none;
        }
        .mi-action-btn:hover.view { color: #6366F1; background: #EEF2FF; }
        .mi-action-btn:hover.del  { color: #DC2626; background: #FEF2F2; }

        .mi-skeleton {
          background: #fff;
          border: 1px solid #E8EAF0;
          border-radius: 20px;
          overflow: hidden;
        }
        .mi-skel-img { height: 190px; background: #F3F4F6; }
        .mi-skel-body { padding: 16px 18px 18px; }
        .mi-skel-line {
          height: 12px; border-radius: 6px;
          background: linear-gradient(90deg, #F3F4F6 25%, #E9EAED 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          margin-bottom: 10px;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .mi-empty {
          text-align: center;
          padding: 64px 32px;
          background: #fff;
          border: 1px solid #E8EAF0;
          border-radius: 24px;
          box-shadow: 0 2px 16px rgba(99,102,241,0.05);
          animation: fadeUp 0.4s ease 0.05s both;
        }
        .mi-empty-icon {
          width: 64px; height: 64px;
          background: #EEF2FF;
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .mi-empty-title {
          font-family: 'Inter', sans-serif;
          font-size: 18px; font-weight: 700;
          color: #111827; margin: 0 0 8px;
        }
        .mi-empty-sub { font-size: 14px; color: #9CA3AF; margin: 0 0 24px; }
        .mi-empty-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%);
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
          transition: opacity 0.2s, transform 0.15s;
        }
        .mi-empty-btn:hover { opacity: 0.92; transform: translateY(-1px); }

        .mi-alert {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 20px;
          border: 1px solid #FECACA;
          background: #FEF2F2;
          color: #DC2626;
          display: flex; align-items: center; gap: 10px;
        }

        .mi-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 20px;
          animation: fadeIn 0.15s ease forwards;
        }
        .mi-modal {
          background: #fff;
          border-radius: 24px;
          padding: 32px 28px;
          width: 100%; max-width: 360px;
          text-align: center;
          box-shadow: 0 24px 64px rgba(0,0,0,0.15);
          position: relative;
          animation: scaleIn 0.2s ease forwards;
        }
        .mi-modal::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #EF4444, #DC2626);
          border-radius: 24px 24px 0 0;
        }
        .mi-modal-icon {
          width: 52px; height: 52px;
          background: #FEF2F2;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .mi-modal-title {
          font-family: 'Inter', sans-serif;
          font-size: 18px; font-weight: 800;
          color: #111827; margin: 0 0 8px;
        }
        .mi-modal-desc { font-size: 13px; color: #9CA3AF; margin: 0 0 24px; line-height: 1.5; }
        .mi-modal-btns { display: flex; gap: 10px; }
        .mi-modal-cancel {
          flex: 1; padding: 12px;
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #6B7280; cursor: pointer;
          transition: background 0.15s;
        }
        .mi-modal-cancel:hover { background: #F3F4F6; }
        .mi-modal-delete {
          flex: 1; padding: 12px;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          border: none; border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700;
          color: white; cursor: pointer;
          box-shadow: 0 4px 14px rgba(239,68,68,0.3);
          transition: opacity 0.2s;
        }
        .mi-modal-delete:disabled { opacity: 0.5; cursor: not-allowed; }
        .mi-modal-delete:hover:not(:disabled) { opacity: 0.9; }

        @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="mi-root">
        <div className="mi-inner">

          <div className="mi-header">
            <div>
              <h1 className="mi-title">My Items</h1>
              <p className="mi-sub">Items you've listed for rent</p>
            </div>
            <Link to="/add-item" className="mi-add-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/>
              </svg>
              Add Item
            </Link>
          </div>

          {error && (
            <div className="mi-alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {loading ? (
            <div className="mi-grid">
              {[1,2,3].map(i => (
                <div key={i} className="mi-skeleton">
                  <div className="mi-skel-img" />
                  <div className="mi-skel-body">
                    <div className="mi-skel-line" style={{width:'70%'}} />
                    <div className="mi-skel-line" style={{width:'40%'}} />
                  </div>
                </div>
              ))}
            </div>

          ) : items.length === 0 ? (
            <div className="mi-empty">
              <div className="mi-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <h3 className="mi-empty-title">No items listed yet</h3>
              <p className="mi-empty-sub">Start earning by renting out your items</p>
              <Link to="/add-item" className="mi-empty-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/>
                </svg>
                List Your First Item
              </Link>
            </div>

          ) : (
            <div className="mi-grid">
              {items.map(item => (
                <div key={item.id} className="mi-card">
                  <div className="mi-img">
                    <img
                      src={item.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
                      alt={item.name}
                      loading="lazy"
                    />
                    <div className="mi-img-overlay" />
                  </div>
                  <div className="mi-body">
                    <h3 className="mi-item-name">{item.name}</h3>
                    <p className="mi-item-cat">{item.category}</p>
                    <div className="mi-footer">
                      <div className="mi-price">
                        &#8377;{item.pricePerDay}<span>/day</span>
                      </div>
                      <div className="mi-actions">
                        <button onClick={() => setDeleteId(item.id)} className="mi-action-btn del" title="Delete item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="mi-overlay" onClick={() => setDeleteId(null)}>
          <div className="mi-modal" onClick={e => e.stopPropagation()}>
            <div className="mi-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </div>
            <h3 className="mi-modal-title">Delete Item?</h3>
            <p className="mi-modal-desc">This action cannot be undone. The item will be permanently removed from your listings.</p>
            <div className="mi-modal-btns">
              <button className="mi-modal-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="mi-modal-delete" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyItems;
import { Link } from 'react-router-dom';
import { addToCart } from '../services/api';
import { useState } from 'react';

const ItemCard = ({ item }) => {
  const [adding, setAdding]   = useState(false);
  const [added, setAdded]     = useState(false);
  const [error, setError]     = useState('');
  const [imgErr, setImgErr]   = useState(false);

  const unavailable = item.availability === false;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    setError('');
    try {
      await addToCart(item.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <style>{`
        .item-card {
          position: relative;
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #e8edf5;
          transition: transform 0.32s cubic-bezier(.22,1,.36,1),
                      box-shadow 0.32s cubic-bezier(.22,1,.36,1),
                      border-color 0.2s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .item-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(37,99,235,0.12), 0 4px 12px rgba(0,0,0,0.06);
          border-color: #bfdbfe;
        }

        .item-card-img {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f0f4ff;
        }
        .item-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(.22,1,.36,1);
        }
        .item-card:hover .item-card-img img {
          transform: scale(1.07);
        }

        /* shimmer on image hover */
        .item-card-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }
        .item-card:hover .item-card-img::after {
          transform: translateX(100%);
        }

        .category-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: capitalize;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          color: #374151;
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .unavailable-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.42);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(2px);
        }
        .unavailable-badge {
          padding: 6px 16px;
          background: rgba(255,255,255,0.93);
          color: #374151;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 999px;
          letter-spacing: 0.02em;
        }

        .item-card-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .item-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
          letter-spacing: -0.01em;
        }
        .item-card:hover .item-name { color: #2563eb; }

        .item-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .item-price {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }
        .price-amount {
          font-size: 1.3rem;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .price-unit {
          font-size: 0.72rem;
          color: #9ca3af;
          font-weight: 500;
        }

        /* Cart button */
        .cart-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(.22,1,.36,1);
          letter-spacing: 0.01em;
        }
        .cart-btn:active { transform: scale(0.94); }
        .cart-btn:disabled { cursor: not-allowed; }

        .cart-btn.default {
          background: #eff6ff;
          color: #2563eb;
        }
        .cart-btn.default:not(:disabled):hover {
          background: #2563eb;
          color: #fff;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          transform: scale(1.04);
        }
        .cart-btn.added   { background: #f0fdf4; color: #16a34a; }
        .cart-btn.errored { background: #fef2f2; color: #dc2626; }
        .cart-btn.disabled-state { background: #f3f4f6; color: #9ca3af; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; display: inline-block; }

        /* No-image placeholder */
        .img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
        }
        .img-placeholder svg { color: #bfdbfe; }
        .img-placeholder span { font-size: 0.7rem; color: #93c5fd; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
      `}</style>

      <Link to={`/items/${item.id}`} className="block h-full" style={{ textDecoration: 'none' }}>
        <div className="item-card">

          {/* ── Image ── */}
          <div className="item-card-img">
            {item.images?.[0] && !imgErr ? (
              <img
                src={item.images[0]}
                alt={item.name}
                loading="lazy"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="img-placeholder">
                <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>No photo</span>
              </div>
            )}

            {/* Category */}
            {item.category && (
              <span className="category-badge">{item.category}</span>
            )}

            {/* Unavailable overlay */}
            {unavailable && (
              <div className="unavailable-overlay">
                <span className="unavailable-badge">Currently Rented</span>
              </div>
            )}
          </div>

          {/* ── Body ── */}
          <div className="item-card-body">
            <h3 className="item-name" title={item.name}>{item.name}</h3>

            {item.owner?.city && (
              <div className="item-location">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.owner?.area ? `${item.owner.area}, ` : ''}{item.owner?.city}
                </span>
              </div>
            )}

            <div className="item-footer">
              <div className="item-price">
                <span className="price-amount">₹{item.pricePerDay}</span>
                <span className="price-unit">/day</span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || unavailable}
                title={error || (unavailable ? 'Not available' : 'Add to cart')}
                className={`cart-btn ${
                  error     ? 'errored'        :
                  added     ? 'added'           :
                  unavailable ? 'disabled-state' :
                  'default'
                }`}
              >
                {adding ? (
                  <>
                    <svg className="spin" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </>
                ) : error ? (
                  <>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Failed
                  </>
                ) : added ? (
                  <>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default ItemCard;
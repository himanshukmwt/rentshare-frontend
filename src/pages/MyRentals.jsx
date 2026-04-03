import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRentals, createReview } from '../services/api';

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  ACTIVE:    { label: 'Active',    color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  RETURNING: { label: 'Returning', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  COMPLETED: { label: 'Completed', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
  EXPIRED:   { label: 'Expired',   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

/* ── Inline SVG icons ── */
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconDanger = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
  </svg>
);
const IconReturn = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill={filled ? '#FBBF24' : '#E5E7EB'} style={{ transition: 'fill 0.15s' }}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>
);

const MyRentals = () => {
  const [rentals, setRentals]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview]         = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState('');

  useEffect(() => {
    getMyRentals()
      .then(res => setRentals(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleReviewSubmit = async () => {
    if (!review.comment.trim()) { setReviewError('Please write a comment.'); return; }
    setSubmitting(true); setReviewError('');
    try {
      await createReview({ rentalId: reviewModal, ...review });
      const res = await getMyRentals();
      setRentals(res.data);
      setReviewModal(null);
      setReview({ rating: 5, comment: '' });
      showSuccess('Review submitted successfully!');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setReviewModal(null);
    setReview({ rating: 5, comment: '' });
    setReviewError('');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F6FA' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E0E2EE', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

        .mr-root {
          min-height: 100vh;
          background: #F5F6FA;
          padding-top: 80px;
          font-family: 'Inter', sans-serif;
          background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 60%);
        }
        .mr-inner { max-width: 860px; margin: 0 auto; padding: 40px 20px 80px; }

        /* Header */
        .mr-header { margin-bottom: 32px; animation: fadeUp 0.4s ease forwards; }
        .mr-title {
          font-family: 'Inter', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #111827; letter-spacing: -0.5px; margin: 0 0 4px;
        }
        .mr-sub { font-size: 14px; color: #9CA3AF; margin: 0; }

        /* Alert */
        .mr-alert {
          padding: 12px 16px; border-radius: 12px; font-size: 13px;
          margin-bottom: 16px; border: 1px solid;
          display: flex; align-items: center; gap: 10px;
          animation: fadeUp 0.2s ease forwards;
        }
        .mr-alert-error   { background: #FEF2F2; border-color: #FECACA; color: #DC2626; }
        .mr-alert-success { background: #ECFDF5; border-color: #A7F3D0; color: #059669; }

        /* Card */
        .mr-card {
          background: #fff;
          border: 1px solid #E8EAF0;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(99,102,241,0.04);
          transition: box-shadow 0.2s;
          position: relative; overflow: hidden;
          animation: fadeUp 0.4s ease both;
        }
        .mr-card::before {
          content: '';
          position: absolute; top: 0; left: 0; bottom: 0; width: 3px;
          background: linear-gradient(180deg, #6366F1, #8B5CF6);
          border-radius: 20px 0 0 20px;
        }
        .mr-card:hover { box-shadow: 0 6px 24px rgba(99,102,241,0.09); }

        .mr-card-inner { display: flex; gap: 16px; padding-left: 8px; }

        .mr-thumb {
          width: 80px; height: 80px;
          border-radius: 14px; object-fit: cover;
          flex-shrink: 0; border: 1px solid #E8EAF0;
        }

        .mr-content { flex: 1; min-width: 0; }

        .mr-top {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 6px; flex-wrap: wrap; gap: 8px;
        }

        .mr-item-name {
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #111827; margin: 0 0 2px;
        }
        .mr-category { font-size: 12px; color: #9CA3AF; margin: 0; text-transform: capitalize; }

        .mr-status-badge {
          display: inline-flex; align-items: center;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 11px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          border: 1px solid;
          white-space: nowrap;
        }

        /* Meta */
        .mr-meta {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: #9CA3AF;
          margin-bottom: 10px; flex-wrap: wrap;
        }
        .mr-meta-dates { display: flex; align-items: center; gap: 6px; }
        .mr-days-chip {
          padding: 2px 8px;
          background: #EEF2FF; color: #4F46E5;
          border-radius: 100px;
          font-size: 11px; font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        /* Returning banner */
        .mr-returning-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 14px;
          background: #FFF7ED; border: 1px solid #FED7AA;
          border-radius: 12px; margin-bottom: 14px;
          font-size: 12px; color: #C2410C; font-weight: 500;
        }

        /* Footer */
        .mr-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }

        .mr-amount { font-size: 13px; }
        .mr-amount strong { font-family: 'Inter', sans-serif; font-weight: 700; color: #111827; font-size: 15px; }
        .mr-amount span { color: #9CA3AF; font-size: 12px; }

        /* Buttons */
        .mr-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .mr-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 13px;
          border-radius: 10px; border: 1px solid;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700;
          cursor: pointer; transition: opacity 0.15s, transform 0.1s;
          white-space: nowrap; text-decoration: none;
        }
        .mr-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .mr-btn-view   { color: #2563EB; background: #EFF6FF; border-color: #BFDBFE; }
        .mr-btn-review { color: #7C3AED; background: #F5F3FF; border-color: #DDD6FE; }

        /* Empty */
        .mr-empty {
          text-align: center; padding: 64px 32px;
          background: #fff; border: 1px solid #E8EAF0;
          border-radius: 24px; box-shadow: 0 2px 16px rgba(99,102,241,0.05);
          animation: fadeUp 0.4s ease both;
        }
        .mr-empty-icon {
          width: 64px; height: 64px; background: #EEF2FF;
          border-radius: 18px; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .mr-empty-title { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px; }
        .mr-empty-sub   { font-size: 14px; color: #9CA3AF; margin: 0 0 24px; }
        .mr-browse-btn {
          display: inline-block;
          padding: 11px 24px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff; border-radius: 12px;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
          text-decoration: none; transition: opacity 0.2s;
        }
        .mr-browse-btn:hover { opacity: 0.88; }

        /* Modal overlay */
        .mr-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 20px;
          animation: fadeIn 0.15s ease forwards;
        }
        .mr-modal {
          background: #fff; border-radius: 24px;
          padding: 28px; width: 100%; max-width: 440px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.15);
          position: relative;
          animation: scaleIn 0.2s ease forwards;
        }
        .mr-modal-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6366F1, #8B5CF6);
          border-radius: 24px 24px 0 0;
        }
        .mr-modal-title {
          font-family: 'Inter', sans-serif;
          font-size: 17px; font-weight: 800;
          color: #111827; margin: 8px 0 4px;
        }
        .mr-modal-sub { font-size: 13px; color: #9CA3AF; margin: 0 0 20px; }

        /* Stars */
        .mr-stars { display: flex; gap: 4px; margin-bottom: 16px; }
        .mr-star-btn {
          background: none; border: none; padding: 0;
          cursor: pointer; transition: transform 0.1s;
        }
        .mr-star-btn:hover { transform: scale(1.15); }

        .mr-field { margin-bottom: 16px; }
        .mr-field-label {
          display: block; font-size: 11px; font-weight: 700;
          color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 7px;
        }
        .mr-input {
          width: 100%; padding: 12px 16px;
          background: #F9FAFB; border: 1.5px solid #E5E7EB;
          border-radius: 12px; color: #111827;
          font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          resize: none; line-height: 1.6;
        }
        .mr-input::placeholder { color: #C4C8D4; }
        .mr-input:focus { border-color: #6366F1; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); background: #fff; }

        /* Modal buttons */
        .mr-modal-btns { display: flex; gap: 10px; margin-top: 4px; }
        .mr-modal-cancel {
          flex: 1; padding: 13px;
          background: #F9FAFB; border: 1.5px solid #E5E7EB;
          border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
          color: #6B7280; transition: background 0.15s;
        }
        .mr-modal-cancel:hover { background: #F3F4F6; }
        .mr-modal-submit {
          flex: 1; padding: 13px;
          border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
          transition: opacity 0.2s;
        }
        .mr-modal-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .mr-modal-submit:hover:not(:disabled) { opacity: 0.9; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
      `}</style>

      <div className="mr-root">
        <div className="mr-inner">

          <div className="mr-header">
            <h1 className="mr-title">My Rentals</h1>
            <p className="mr-sub">Track your rental history</p>
          </div>

          {success && (
            <div className="mr-alert mr-alert-success">
              <IconCheck /> {success}
            </div>
          )}

          {rentals.length === 0 ? (
            <div className="mr-empty">
              <div className="mr-empty-icon"><IconClipboard /></div>
              <h3 className="mr-empty-title">No rentals yet</h3>
              <p className="mr-empty-sub">Start browsing and rent your first item</p>
              <Link to="/" className="mr-browse-btn">Browse Items</Link>
            </div>
          ) : (
            <div>
              {rentals.map((rental, idx) => {
                const days = Math.ceil(
                  (new Date(rental.endDate) - new Date(rental.startDate)) / (1000 * 60 * 60 * 24)
                );
                const cfg = STATUS_CONFIG[rental.status] || STATUS_CONFIG.CANCELLED;
                return (
                  <div key={rental.id} className="mr-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="mr-card-inner">
                      <img
                        src={rental.item?.images?.[0] || 'https://placehold.co/80x80?text=—'}
                        alt={rental.item?.name}
                        className="mr-thumb"
                      />
                      <div className="mr-content">

                        {/* Returning banner */}
                        {rental.status === 'RETURNING' && (
                          <div className="mr-returning-banner">
                            <IconReturn />
                            Please return the item to the owner
                          </div>
                        )}

                        {/* Top row */}
                        <div className="mr-top">
                          <div>
                            <p className="mr-item-name">{rental.item?.name}</p>
                            <p className="mr-category">{rental.item?.category}</p>
                          </div>
                          <span
                            className="mr-status-badge"
                            style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                          >
                            {cfg.label}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="mr-meta">
                          <div className="mr-meta-dates">
                            <span>{new Date(rental.startDate).toLocaleDateString('en-IN')}</span>
                            <IconArrow />
                            <span>{new Date(rental.endDate).toLocaleDateString('en-IN')}</span>
                          </div>
                          <span className="mr-days-chip">{days} day{days !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Footer */}
                        <div className="mr-footer">
                          <div className="mr-amount">
                            <strong>₹{rental.rentalAmount}</strong>
                            <span> + ₹{rental.depositAmount} deposit</span>
                          </div>

                          <div className="mr-actions">
                            <Link to={`/rentals/${rental.id}`} className="mr-btn mr-btn-view">
                              View Details
                            </Link>
                            {rental.status === 'COMPLETED' && (
                              <button
                                className="mr-btn mr-btn-review"
                                onClick={() => { setReviewModal(rental.id); setReviewError(''); }}
                              >
                                Leave Review
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="mr-overlay" onClick={closeModal}>
          <div className="mr-modal" onClick={e => e.stopPropagation()}>
            {/* <div className="mr-modal-bar" /> */}

            <h3 className="mr-modal-title">Leave a Review</h3>
            <p className="mr-modal-sub">Rate your experience with this rental</p>

            {reviewError && (
              <div className="mr-alert mr-alert-error" style={{ marginBottom: 16 }}>
                <IconDanger /> {reviewError}
              </div>
            )}

            {/* Star Rating */}
            <div className="mr-field">
              <label className="mr-field-label">Your Rating</label>
              <div className="mr-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className="mr-star-btn"
                    onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                  >
                    <StarIcon filled={star <= review.rating} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mr-field">
              <label className="mr-field-label">Your Comment *</label>
              <textarea
                placeholder="Share your experience..."
                value={review.comment}
                onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={3}
                className="mr-input"
              />
            </div>

            <div className="mr-modal-btns">
              <button className="mr-modal-cancel" onClick={closeModal}>Cancel</button>
              <button
                className="mr-modal-submit"
                onClick={handleReviewSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyRentals;
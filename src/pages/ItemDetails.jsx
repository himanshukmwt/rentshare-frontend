import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItemById, addToCart, createRental } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import Alert from '../components/Alert';

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [rentalLoading, setRentalLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [rentalError, setRentalError] = useState('');
  const [bookedDates, setBookedDates] = useState([]);
  const [cartSuccess, setCartSuccess] = useState('');
  const [cartError, setCartError]     = useState('');

  useEffect(() => {
    getItemById(id)
      .then(res => {
        setItem(res.data);
        setBookedDates(res.data.rentals?.filter(r => ['ACTIVE', 'PENDING'].includes(r.status)) || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const days = startDate && endDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPrice = days * (item?.pricePerDay || 0);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    setCartLoading(true);
    try {
      await addToCart(item.id);
      setCartSuccess('Item added to cart!');
    } catch (err) {
      setCartError(err.response?.data?.message || 'Error adding to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const handleRentNow = async () => {
    if (!user) return navigate('/login');
    if (!startDate || !endDate) return alert('Select dates first');
    setRentalLoading(true);
    try {
      const res = await createRental({ itemId: item.id, startDate, endDate });
      navigate('/payment', { state: { rental: res.data.result } });
    } catch (err) {
      setRentalError(err.response?.data?.message || 'Error creating rental');
    } finally {
      setRentalLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16 bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 tracking-wide">Loading item…</p>
      </div>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex items-center justify-center pt-16 bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Item not found</p>
      </div>
    </div>
  );

  const avgRating = item.reviews?.length
    ? (item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length).toFixed(1)
    : null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .font-display { font-family: 'DM Serif Display', Georgia, serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        /* Image gallery */
        .main-img-wrap {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #f0f4ff;
          aspect-ratio: 4/3;
          border: 1px solid #e5eaf5;
          box-shadow: 0 8px 32px rgba(37,99,235,0.08);
        }
        .main-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(.22,1,.36,1);
        }
        .main-img-wrap:hover img { transform: scale(1.03); }

        .thumb-btn {
          width: 68px; height: 68px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .thumb-btn:hover { border-color: #93c5fd; transform: translateY(-2px); }
        .thumb-btn.active { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .thumb-btn img { width: 100%; height: 100%; object-fit: cover; }

        /* Availability dot */
        .avail-dot {
          width: 8px; height: 8px; border-radius: 50%;
          display: inline-block; margin-right: 6px;
        }

        /* Date inputs */
        .date-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e5eaf5;
          border-radius: 12px;
          font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          color: #1f2937;
          background: #fafbff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .date-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
          background: #fff;
        }

        /* Buttons */
        .btn-primary {
          width: 100%; padding: 13px;
          background: #2563eb;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(.22,1,.36,1);
          letter-spacing: 0.01em;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 6px 20px rgba(37,99,235,0.35);
          transform: translateY(-1px);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-outline {
          width: 100%; padding: 13px;
          background: transparent;
          color: #2563eb;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 14px;
          border: 1.5px solid #2563eb;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-outline:hover:not(:disabled) {
          background: #eff6ff;
          box-shadow: 0 4px 14px rgba(37,99,235,0.12);
        }
        .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Price summary box */
        .price-summary {
          background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
          border: 1px solid #bfdbfe;
          border-radius: 14px;
          padding: 14px 16px;
        }

        /* Owner card */
        .owner-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #f8faff;
          border: 1px solid #e8edf8;
          border-radius: 14px;
        }
        .owner-avatar {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* Stars */
        .star-filled { color: #f59e0b; }
        .star-empty  { color: #e5e7eb; }

        /* Section heading */
        .section-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 6px;
        }

        /* Booking box */
        .booking-box {
          background: white;
          border: 1.5px solid #e8edf5;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 4px 24px rgba(37,99,235,0.06);
          position: sticky;
          top: 90px;
        }

        /* Fade in */
        .fade-in {
          animation: fadeInUp 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .img-placeholder-lg {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
          background: linear-gradient(135deg, #eff6ff, #e0e7ff);
        }
      `}</style>

      <div className="font-body min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start fade-in">

            {/* ── Left: Images ── */}
            <div>
              <div className="main-img-wrap mb-3">
                {item.images?.[selectedImage] ? (
                  <img src={item.images[selectedImage]} alt={item.name} />
                ) : (
                  <div className="img-placeholder-lg">
                    <svg className="w-16 h-16 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-blue-300 font-medium uppercase tracking-widest">No Photo</span>
                  </div>
                )}

                {/* Availability ribbon */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm ${
                    item.availability
                      ? 'bg-green-500/90 text-white'
                      : 'bg-red-500/90 text-white'
                  }`}>
                    <span className="avail-dot bg-white opacity-80" />
                    {item.availability ? 'Available' : 'Currently Rented'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {item.images?.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {item.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`thumb-btn ${selectedImage === i ? 'active' : ''}`}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Details + Booking ── */}
            <div className="flex flex-col gap-5">

              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full capitalize border border-blue-100">
                  {item.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl text-gray-900 leading-tight">
                {item.name}
              </h1>

              {/* Rating */}
              {avgRating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'star-filled' : 'star-empty'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{avgRating}</span>
                  <span className="text-gray-400 text-sm">({item.reviews?.length} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-blue-600" style={{ letterSpacing: '-0.02em' }}>
                  ₹{item.pricePerDay}
                </span>
                <span className="text-gray-400 text-sm font-medium">/day</span>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-gray-500 leading-relaxed text-sm border-t border-gray-100 pt-4">
                  {item.description}
                </p>
              )}

              {/* Owner / Location */}
              {item.owner?.city && (
                <div className="owner-card">
                  <div className="owner-avatar">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="section-label" style={{ marginBottom: 2 }}>Location</p>
                    <p className="text-sm font-medium text-gray-700">
                      {item.owner?.area ? `${item.owner.area}, ` : ''}{item.owner?.city}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Booking Box ── */}
              {item.availability && (
                <div className="booking-box">
                  <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Select Rental Dates
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="section-label">Start Date</p>
                      <input
                        type="date"
                        className="date-input"
                        value={startDate}
                        min={today}
                        onChange={e => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="section-label">End Date</p>
                      <input
                        type="date"
                        className="date-input"
                        value={endDate}
                        min={startDate || today}
                        onChange={e => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Price breakdown */}
                  {days > 0 && (
                    <div className="price-summary mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">₹{item.pricePerDay} × {days} {days === 1 ? 'day' : 'days'}</span>
                        <span className="font-bold text-blue-600 text-base">₹{totalPrice}</span>
                      </div>
                    </div>
                  )}

                  <Alert type="error" message={rentalError} />

                  {/* Cart feedback */}
                  {cartSuccess && (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 p-3 rounded-xl mb-3 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      {cartSuccess}
                    </div>
                  )}
                  {cartError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-3 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      {cartError}
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={handleRentNow}
                      disabled={rentalLoading || !startDate || !endDate}
                      className="btn-primary"
                    >
                      {rentalLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                          Processing…
                        </span>
                      ) : 'Rent Now →'}
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={cartLoading}
                      className="btn-outline"
                    >
                      {cartLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                          Adding…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                          Add to Cart
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Not available message */}
              {!item.availability && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Currently Unavailable</p>
                    {bookedDates[0] && (
                      <p className="text-xs text-red-400 mt-0.5">
                        Available after {new Date(bookedDates[0].endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Reviews ── */}
          {item.reviews?.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="font-display text-2xl text-gray-900">Reviews</h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full border border-blue-100">
                  {item.reviews.length}
                </span>
                {avgRating && (
                  <div className="flex items-center gap-1 ml-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="text-sm font-bold text-gray-700">{avgRating} avg</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemDetails;

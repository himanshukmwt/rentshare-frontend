import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyCart, removeFromCart, clearCart, checkout } from '../services/api';
import Alert from '../components/Alert';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await getMyCart();
      setCart(res.data);
    } catch {
      setError('Failed to load cart. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setCart(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId) }));
    } catch {
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    try {
      await clearCart();
      setCart(prev => ({ ...prev, items: [] }));
    } catch {
      setError('Failed to clear cart. Please try again.');
    }
  };

  const handleCheckout = async () => {
    const items = cart?.items || [];
    setError('');

    for (const item of items) {
      if (!dates[item.id]?.start || !dates[item.id]?.end) {
        return setError(`Please select rental dates for: "${item.name}"`);
      }
      if (dates[item.id].start >= dates[item.id].end) {
        return setError(`End date must be after start date for: "${item.name}"`);
      }
    }

    setCheckoutLoading(true);
    try {
      const res = await checkout({
        itemId:    items[0].id,
        startDate: dates[items[0].id].start,
        endDate:   dates[items[0].id].end,
      });
      navigate('/payment', { state: { rental: res.data.rental } });
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const items = cart?.items || [];
  const today = new Date().toISOString().split('T')[0];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        <Alert type="error" message={error} />

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-6">Browse items and add them to your cart</p>
            <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold">
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                <div className="flex gap-4">
                  {/* Image */}
                  <img
                    src={item.images?.[0] || 'https://placehold.co/100x100?text=Item'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                    loading="lazy"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-blue-600 text-sm">₹{item.pricePerDay}/day</span>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex gap-3 flex-wrap">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                        <input
                          type="date"
                          min={today}
                          value={dates[item.id]?.start || ''}
                          onChange={(e) => setDates(prev => ({
                            ...prev,
                            [item.id]: { ...prev[item.id], start: e.target.value }
                          }))}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">End Date</label>
                        <input
                          type="date"
                          min={dates[item.id]?.start || today}
                          value={dates[item.id]?.end || ''}
                          onChange={(e) => setDates(prev => ({
                            ...prev,
                            [item.id]: { ...prev[item.id], end: e.target.value }
                          }))}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </div>

                      {/* Day count */}
                      {dates[item.id]?.start && dates[item.id]?.end && dates[item.id].start < dates[item.id].end && (
                        <div className="flex items-end">
                          <span className="text-xs text-gray-500 pb-2">
                            {Math.ceil((new Date(dates[item.id].end) - new Date(dates[item.id].start)) / 86400000)} days
                            {' · '}
                            <span className="font-semibold text-blue-600">
                              ₹{Math.ceil((new Date(dates[item.id].end) - new Date(dates[item.id].start)) / 86400000) * item.pricePerDay}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Checkout */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Processing...
                  </>
                ) : `Proceed to Checkout (${items.length} item${items.length !== 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

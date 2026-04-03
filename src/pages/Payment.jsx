import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, createOrder, verifyPayment } from '../services/api';
import Alert from '../components/Alert';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rental } = location.state || {};

  const [userUpi, setUserUpi]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(1);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    getProfile().then(res => setUserUpi(res.data.upiId || ''));
  }, []);

  if (!rental) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <p className="text-gray-500 mb-4">No rental found</p>
        <button onClick={() => navigate('/my-rentals')}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl">
          Go to Rentals
        </button>
      </div>
    </div>
  );

  const totalAmount = rental.totalAmount ||
    (rental.rentalAmount + rental.depositAmount + (rental.platformFee || 0));

  const days = Math.ceil(
    (new Date(rental.endDate) - new Date(rental.startDate)) / (1000 * 60 * 60 * 24)
  );

  const handlePay = async () => {
    if (!userUpi) return setError('Profile mein UPI ID add karo');
    setLoading(true);
    setError('');
    try {
      const orderRes = await createOrder({ rentalId: rental.id });
      const { orderId, amount, keyId } = orderRes.data;
      const options = {
        key: keyId,
        amount: amount * 100,
        currency: 'INR',
        name: 'RentShare',
        description: `Rental - ${rental.item?.name}`,
        order_id: orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || '9999999999',
          vpa: 'success@razorpay',
        },
        theme: { color: '#2563eb' },
        config: {
          display: {
            blocks: { upi: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] } },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: false },
          },
        },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              rentalId: rental.id,
            });
            setStep(3);
          } catch {
            setError('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => { setLoading(false); setError('Payment cancelled'); },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError('Payment failed, dobara try karo');
    } finally {
      setLoading(false);
    }
  };

  /* ── Terms Modal ─────────────────────────────────────── */
  const terms = [
    {
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Refund Policy',
      desc: `Security deposit of ₹${rental.depositAmount} will be refunded within 5 working days after safe return of the item.`,
    },
    {
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
      title: 'Damage Liability',
      desc: 'If the item is returned damaged, you will be charged for the repair/replacement cost. This may be deducted from your deposit.',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Late Return',
      desc: `Returning the item after ${new Date(rental.endDate).toLocaleDateString('en-IN')} will incur extra charges per day based on the daily rental rate.`,
    },
    {
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Item Care',
      desc: 'You are responsible for the item during the rental period. Please handle it with care and return it in the same condition.',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      title: 'Cancellation',
      desc: 'Once payment is made, the rental cannot be cancelled. In case of disputes, contact our support team.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  : s
                }
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 1 — Order Summary ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              {rental.item?.images?.[0] ? (
                <img
                  src={rental.item.images[0]}
                  alt={rental.item?.name}
                  className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{rental.item?.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{rental.item?.category}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(rental.startDate).toLocaleDateString('en-IN')} →{' '}
                  {new Date(rental.endDate).toLocaleDateString('en-IN')}
                  <span className="ml-2 text-blue-600 font-medium">({days} days)</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rental Amount</span>
                <span className="font-medium">₹{rental.rentalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Security Deposit</span>
                <span className="font-medium">₹{rental.depositAmount}</span>
              </div>
              {rental.platformFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform Fee</span>
                  <span className="font-medium">₹{rental.platformFee}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-blue-600 text-lg">₹{totalAmount}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl mb-6">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700">
                Security deposit of <strong>₹{rental.depositAmount}</strong> will be refunded after safe return.
              </p>
            </div>

            {/* Opens Terms modal */}
            <button
              onClick={() => setShowTerms(true)}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Proceed to Pay ₹{totalAmount}
            </button>
          </div>
        )}

        {/* ── Step 2 — Payment ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pay via Razorpay</h2>
            <p className="text-gray-500 text-sm mb-6">Secure payment powered by Razorpay</p>

            <div className="text-center p-4 bg-blue-50 rounded-xl mb-6">
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-blue-600">₹{totalAmount}</p>
            </div>

            {userUpi ? (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Paying from</p>
                  <p className="text-sm font-medium text-gray-900">{userUpi}</p>
                </div>
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="p-3 bg-red-50 rounded-xl mb-4">
                <p className="text-sm text-red-600">
                  UPI ID nahi hai!{' '}
                  <a href="/profile" className="underline ml-1">Profile mein add karo</a>
                </p>
              </div>
            )}

            <Alert type="error" message={error} />

            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl mb-6">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-xs text-green-700">Secure payment — powered by Razorpay</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handlePay}
                disabled={loading || !userUpi}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ₹${totalAmount}`}
              </button>
              <button onClick={() => setStep(1)}
                className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                Back
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Success ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-2">Your rental is now confirmed</p>
            <p className="text-blue-600 font-semibold text-lg mb-6">₹{totalAmount} paid</p>
            <div className="p-4 bg-gray-50 rounded-xl mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Item</span>
                <span className="font-medium">{rental.item?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{days} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  ACTIVE
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl mb-6">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p className="text-xs text-blue-700">
                Owner ka location share ho gaya hai. Rental details mein dekho!
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/my-rentals')}
                className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50">
                My Rentals
              </button>
              <button onClick={() => navigate('/')}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">
                Browse More
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Terms & Conditions Modal ── */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowTerms(false)}
          />

          {/* Sheet */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">Terms & Conditions</h3>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Terms list */}
            <div className="px-6 py-4 space-y-4 max-h-72 overflow-y-auto">
              {terms.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {t.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">{t.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-4">
                By clicking "I Agree", you accept all the above terms and conditions.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTerms(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => { setShowTerms(false); setStep(2); }}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
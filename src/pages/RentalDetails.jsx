import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRentalById } from '../services/api';

const statusColors = {
  PENDING:   'bg-yellow-50 text-yellow-700',
  ACTIVE:    'bg-green-50 text-green-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  EXPIRED:   'bg-red-50 text-red-600',
  RETURNING: 'bg-orange-50 text-orange-700',
};

const RentalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRentalById(id)
      .then(res => setRental(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!rental) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Rental not found</p>
        <button onClick={() => navigate('/my-rentals')} className="px-6 py-2 bg-blue-600 text-white rounded-xl">
          Go Back
        </button>
      </div>
    </div>
  );

  const days = Math.ceil((new Date(rental.endDate) - new Date(rental.startDate)) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => navigate('/my-rentals')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Rentals
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rental Details</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[rental.status]}`}>
            {rental.status}
          </span>
        </div>

        {/* Item */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Item</h2>
          <div className="flex gap-4">
            {rental.item?.images?.[0] ? (
              <img
                src={rental.item.images[0]}
                alt={rental.item?.name}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{rental.item?.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{rental.item?.category}</p>
              <p className="text-blue-600 font-semibold mt-1">₹{rental.item?.pricePerDay}/day</p>
            </div>
          </div>
        </div>

        {/* OTP */}
        {rental.status === 'ACTIVE' && !rental.isPickedUp && rental.pickupOTP && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-blue-600 font-medium">Show this OTP to owner for pickup</p>
            </div>
            <p className="text-4xl font-bold text-blue-700 tracking-[0.3em]">{rental.pickupOTP}</p>
          </div>
        )}

        {/* Picked Up Badge */}
        {rental.isPickedUp && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Picked Up
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Rental Period</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Start Date</p>
              <p className="font-semibold text-gray-900 text-sm">{new Date(rental.startDate).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-400 mb-1">Duration</p>
              <p className="font-bold text-blue-600">{days} days</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">End Date</p>
              <p className="font-semibold text-gray-900 text-sm">{new Date(rental.endDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Payment Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rental Amount</span>
              <span className="font-medium text-gray-900">₹{rental.rentalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Security Deposit</span>
              <span className="font-medium text-gray-900">₹{rental.depositAmount}</span>
            </div>
            {rental.platformFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Fee</span>
                <span className="font-medium text-gray-900">₹{rental.platformFee}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-blue-600 text-lg">₹{rental.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Late Return */}
        {rental.extraDays > 1 && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Late Return Charge</h2>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-orange-600">Extra Days</span>
              <span className="font-medium text-orange-700">{rental.extraDays} days</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-orange-600">Extra Charge</span>
              <span className="font-medium text-orange-700">₹{rental.extraCharge}</span>
            </div>
            <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between text-sm">
              <span className="text-orange-600">Deposit Refund</span>
              <span className="font-medium text-orange-700">₹{rental.depositAmount - rental.extraCharge}</span>
            </div>
          </div>
        )}

        {/* Owner Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Owner Info</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">{rental.item?.owner?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{rental.item?.owner?.name}</p>
              {rental.item?.owner?.city && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {rental.item?.owner?.area}, {rental.item?.owner?.city}
                </div>
              )}
            </div>
          </div>

          {rental.status === 'ACTIVE' && rental.locationLink && (
            <div className="flex gap-2 flex-wrap">
              <a
                href={rental.locationLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                View on Google Maps
              </a>

              {rental.item?.owner?.phoneNumber?.trim() && (
                <a
                  href={`https://wa.me/91${rental.item?.owner?.phoneNumber}?text=${encodeURIComponent(
                    `Hi, I have booked your item.\n\nBooking Details:\nItem: ${rental.item?.name || ''}\nFrom: ${rental.startDate}\nTo: ${rental.endDate}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Owner
                </a>
              )}
            </div>
          )}
        </div>

        {/* Damage Report */}
        {rental.isDamaged && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide">Damage Report</h2>
            </div>
            <p className="text-sm text-red-700 mb-2">{rental.damageReport}</p>
            {rental.damageAmount && (
              <p className="text-sm font-medium text-red-700">Damage Charge: ₹{rental.damageAmount}</p>
            )}
            {rental.damageProofUrls?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {rental.damageProofUrls.map((url, i) => (
                  <img key={i} src={url} alt="Damage" className="w-20 h-20 object-cover rounded-xl border border-red-200" />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default RentalDetails;

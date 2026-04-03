import { useState, useEffect } from 'react';
import { getOwnerRentals, ownerRequest,verifyPickupOTP } from '../services/api';


const STATUS_CONFIG = {
  PENDING:        { label: 'Pending',        color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  ACTIVE:         { label: 'Active',         color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  RETURNING:      { label: 'Returning',      color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  PENDING_REVIEW: { label: 'Admin Review',   color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  COMPLETED:      { label: 'Completed',      color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  CANCELLED:      { label: 'Cancelled',      color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
  EXPIRED:        { label: 'Expired',        color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

/* ── Inline SVG icons ── */
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconWarning = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconDanger = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconDamaged = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconBox = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
  </svg>
);
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const OwnerRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [damageModal, setDamageModal] = useState(null);
  const [damageForm, setDamageForm] = useState({ report: '', amount: '' });
  const [damagePhotos, setDamagePhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [otpModal, setOtpModal] = useState(null);
const [pickupOtp, setPickupOtp] = useState('');
const [otpError, setOtpError] = useState('');

  useEffect(() => {
    getOwnerRentals()
      .then(res => setRentals(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError   = (msg) => { setError(msg);   setTimeout(() => setError(''), 3000); };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) return showError('Max 3 photos allowed');
    setDamagePhotos(files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleRequest = async (rentalId, type) => {
    if (type !== 'complete') { setDamageModal({ rentalId, type }); setError(''); return; }
    try {
      const fd = new FormData(); fd.append('rentalId', rentalId);
      await ownerRequest(fd);
      setRentals(prev => prev.map(r => r.id === rentalId ? { ...r, status: 'PENDING_REVIEW' } : r));
      showSuccess('Request sent to admin successfully.');
    } catch (err) { showError(err.response?.data?.message || 'Error'); }
  };

  const handleDamageSubmit = async () => {
    if (!damageForm.report) return showError('Damage description is required.');
    if (damagePhotos.length === 0) return showError('At least one damage photo is required.');
    if (damageModal.type === 'minor' && !damageForm.amount) return showError('Damage amount is required.');
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('rentalId', damageModal.rentalId);
      fd.append('damageReport', damageForm.report);
      if (damageModal.type === 'minor') fd.append('damageAmount', damageForm.amount);
      damagePhotos.forEach(p => fd.append('damagePhotos', p));
      await ownerRequest(fd);
      setRentals(prev => prev.map(r =>
        r.id === damageModal.rentalId ? { ...r, status: 'PENDING_REVIEW', isDamaged: true } : r
      ));
      setDamageModal(null);
      setDamageForm({ report: '', amount: '' });
      setDamagePhotos([]); setPhotoPreviews([]);
      showSuccess('Damage report submitted to admin.');
    } catch (err) { showError(err.response?.data?.message || 'Error reporting damage'); }
    finally { setSubmitting(false); }
  };

  const handlePickupVerify = async () => {
  if (!pickupOtp || pickupOtp.length !== 4) {
    return setOtpError('Please enter 4 digit OTP');
  }
  try {
    await verifyPickupOTP({ rentalId: otpModal, otp: pickupOtp.toString() });
    setRentals(prev => prev.map(r =>
      r.id === otpModal ? { ...r, isPickedUp: true } : r
    ));
    setOtpModal(null);
    setPickupOtp('');
    showSuccess('Pickup confirmed');
  } catch (err) {
    setOtpError(err.response?.data?.message || 'Invalid OTP');
  }
};

  const closeModal = () => {
    setDamageModal(null);
    setDamageForm({ report: '', amount: '' });
    setDamagePhotos([]); setPhotoPreviews([]); setError('');
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F5F6FA' }}>
      <div style={{ width:32, height:32, border:'3px solid #E0E2EE', borderTopColor:'#6366F1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

        .or-root {
          min-height: 100vh;
          background: #F5F6FA;
          padding-top: 80px;
          font-family: 'Inter', sans-serif;
          background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 60%);
        }
        .or-inner { max-width: 860px; margin: 0 auto; padding: 40px 20px 80px; }

        /* Header */
        .or-header { margin-bottom: 32px; animation: fadeUp 0.4s ease forwards; }
        .or-title {
          font-family: 'Inter', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #111827; letter-spacing: -0.5px; margin: 0 0 4px;
        }
        .or-sub { font-size: 14px; color: #9CA3AF; margin: 0; }

        /* Alert */
        .or-alert {
          padding: 12px 16px; border-radius: 12px; font-size: 13px;
          margin-bottom: 16px; border: 1px solid;
          display: flex; align-items: center; gap: 10px;
          animation: fadeUp 0.2s ease forwards;
        }
        .or-alert-error  { background:#FEF2F2; border-color:#FECACA; color:#DC2626; }
        .or-alert-success{ background:#ECFDF5; border-color:#A7F3D0; color:#059669; }

        /* Rental card */
        .or-card {
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
        .or-card::before {
          content: '';
          position: absolute; top: 0; left: 0; bottom: 0; width: 3px;
          background: linear-gradient(180deg, #6366F1, #8B5CF6);
          border-radius: 20px 0 0 20px;
        }
        .or-card:hover { box-shadow: 0 6px 24px rgba(99,102,241,0.09); }

        .or-card-inner { display: flex; gap: 16px; padding-left: 8px; }

        .or-thumb {
          width: 80px; height: 80px;
          border-radius: 14px; object-fit: cover;
          flex-shrink: 0; border: 1px solid #E8EAF0;
        }

        .or-content { flex: 1; min-width: 0; }

        .or-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px; }

        .or-item-name {
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #111827; margin: 0 0 2px;
        }
        .or-renter { font-size: 12px; color: #9CA3AF; margin: 0; }
        .or-renter strong { color: #374151; font-weight: 600; }

        .or-badges { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }

        .or-status-badge {
          display: inline-flex; align-items: center;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 11px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          border: 1px solid;
          white-space: nowrap;
        }
        .or-damaged-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 11px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #DC2626; background: #FEF2F2; border: 1px solid #FECACA;
        }

        /* Meta row */
        .or-meta {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: #9CA3AF;
          margin-bottom: 10px; flex-wrap: wrap;
        }
        .or-meta-dates { display: flex; align-items: center; gap: 6px; }
        .or-days-chip {
          padding: 2px 8px;
          background: #EEF2FF; color: #4F46E5;
          border-radius: 100px;
          font-size: 11px; font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        /* Extra days */
        .or-extra {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px;
          background: #FFF7ED; border: 1px solid #FED7AA;
          border-radius: 10px; margin-bottom: 10px;
          font-size: 12px; color: #C2410C;
        }

        /* Footer row */
        .or-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }

        .or-amount { font-size: 13px; }
        .or-amount strong { font-family: 'Inter', sans-serif; font-weight: 700; color: #111827; font-size: 15px; }
        .or-amount span { color: #9CA3AF; font-size: 12px; }

        /* Action buttons */
        .or-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .or-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 13px;
          border-radius: 10px; border: 1px solid;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700;
          cursor: pointer; transition: opacity 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .or-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .or-btn-complete { color:#059669; background:#ECFDF5; border-color:#A7F3D0; }
        .or-btn-minor    { color:#D97706; background:#FFFBEB; border-color:#FDE68A; }
        .or-btn-major    { color:#DC2626; background:#FEF2F2; border-color:#FECACA; }

        .or-review-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 13px;
          background: #F5F3FF; border: 1px solid #DDD6FE;
          border-radius: 10px;
          font-size: 12px; font-weight: 600; color: #7C3AED;
          font-family: 'Inter', sans-serif;
        }

        /* Damage report block */
        .or-dmg-report {
          margin-top: 14px; padding: 12px 14px;
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 12px;
        }
        .or-dmg-report-title { font-size: 11px; font-weight: 700; color: #991B1B; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
        .or-dmg-report-text  { font-size: 12px; color: #DC2626; margin: 0 0 4px; }
        .or-dmg-report-amt   { font-size: 12px; font-weight: 700; color: #991B1B; }

        /* Empty */
        .or-empty {
          text-align: center; padding: 64px 32px;
          background: #fff; border: 1px solid #E8EAF0;
          border-radius: 24px; box-shadow: 0 2px 16px rgba(99,102,241,0.05);
          animation: fadeUp 0.4s ease both;
        }
        .or-empty-icon {
          width: 64px; height: 64px; background: #EEF2FF;
          border-radius: 18px; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .or-empty-title { font-family:'Inter',sans-serif; font-size:18px; font-weight:700; color:#111827; margin:0 0 8px; }
        .or-empty-sub   { font-size:14px; color:#9CA3AF; margin:0; }

        /* Modal overlay */
        .or-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 20px;
          animation: fadeIn 0.15s ease forwards;
        }
        .or-modal {
          background: #fff; border-radius: 24px;
          padding: 28px; width: 100%; max-width: 440px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0,0,0,0.15);
          position: relative;
          animation: scaleIn 0.2s ease forwards;
        }
        .or-modal-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          border-radius: 24px 24px 0 0;
        }
        .or-modal-title {
          font-family: 'Inter', sans-serif;
          font-size: 17px; font-weight: 800;
          color: #111827; margin: 8px 0 4px;
        }
        .or-modal-sub { font-size: 13px; color: #9CA3AF; margin: 0 0 20px; }

        .or-field { margin-bottom: 16px; }
        .or-field-label {
          display: block; font-size: 11px; font-weight: 700;
          color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 7px;
        }
        .or-input {
          width: 100%; padding: 12px 16px;
          background: #F9FAFB; border: 1.5px solid #E5E7EB;
          border-radius: 12px; color: #111827;
          font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .or-input::placeholder { color: #C4C8D4; }
        .or-input:focus { border-color: #6366F1; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); background: #fff; }
        textarea.or-input { resize: none; line-height: 1.6; }

        /* Photo previews in modal */
        .or-photo-previews { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .or-photo-thumb { width: 72px; height: 72px; object-fit: cover; border-radius: 10px; border: 1px solid #E5E7EB; }

        .or-upload-zone {
          width: 100%; border: 1.5px dashed #D1D5DB; border-radius: 12px;
          padding: 20px; text-align: center; cursor: pointer; position: relative;
          background: #F9FAFB; transition: border-color 0.2s, background 0.2s;
        }
        .or-upload-zone:hover { border-color: #6366F1; background: #EEF2FF; }
        .or-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
        .or-upload-label { font-size: 12px; color: #9CA3AF; margin-top: 6px; }

        /* Modal buttons */
        .or-modal-btns { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .or-modal-submit {
          width: 100%; padding: 13px;
          border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
          color: white; transition: opacity 0.2s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .or-modal-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .or-modal-submit:hover:not(:disabled) { opacity: 0.9; }
        .or-modal-cancel {
          width: 100%; padding: 13px;
          background: #F9FAFB; border: 1.5px solid #E5E7EB;
          border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
          color: #6B7280; transition: background 0.15s;
        }
        .or-modal-cancel:hover { background: #F3F4F6; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
      `}</style>

      <div className="or-root">
        <div className="or-inner">

          <div className="or-header">
            <h1 className="or-title">Items Rented Out</h1>
            <p className="or-sub">Manage rentals of your listed items</p>
          </div>

          {error   && <div className="or-alert or-alert-error">  <IconDanger />  {error}   </div>}
          {success && <div className="or-alert or-alert-success"><IconCheck />   {success} </div>}

          {rentals.length === 0 ? (
            <div className="or-empty">
              <div className="or-empty-icon"><IconBox /></div>
              <h3 className="or-empty-title">No rentals yet</h3>
              <p className="or-empty-sub">Your items have not been rented out yet</p>
            </div>
          ) : (
            <div>
              {rentals.map((rental, idx) => {
                const days = Math.ceil(
                  (new Date(rental.endDate) - new Date(rental.startDate)) / (1000 * 60 * 60 * 24)
                );
                const cfg = STATUS_CONFIG[rental.status] || STATUS_CONFIG.CANCELLED;
                return (
                  <div key={rental.id} className="or-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="or-card-inner">
                      <img
                        src={rental.item?.images?.[0] || 'https://placehold.co/80x80?text=—'}
                        alt={rental.item?.name}
                        className="or-thumb"
                      />
                      <div className="or-content">

                        {/* Top row */}
                        <div className="or-top">
                          <div>
                            <p className="or-item-name">{rental.item?.name}</p>
                            <p className="or-renter">Renter: <strong>{rental.user?.name}</strong></p>
                          </div>
                          <div className="or-badges">
                            {rental.isDamaged && (
                              <span className="or-damaged-badge">
                                <IconDamaged /> Damaged
                              </span>
                            )}
                            <span
                              className="or-status-badge"
                              style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="or-meta">
                          <div className="or-meta-dates">
                            <span>{new Date(rental.startDate).toLocaleDateString('en-IN')}</span>
                            <IconArrow />
                            <span>{new Date(rental.endDate).toLocaleDateString('en-IN')}</span>
                          </div>
                          <span className="or-days-chip">{days} days</span>
                        </div>

                        {/* Extra days */}
                        {rental.extraDays > 1 && (
                          <div className="or-extra">
                            <IconClock />
                            <span>{rental.extraDays} extra days — ₹{rental.extraCharge} will be deducted from deposit</span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="or-footer">
                          <div className="or-amount">
                            <strong>₹{rental.rentalAmount}</strong>
                            <span> + ₹{rental.depositAmount} deposit</span>
                          </div>


{/* ACTIVE rental - Owner OTP verify kare */}
{rental.status === 'ACTIVE' && !rental.isPickedUp && (
  <button
    onClick={() => setOtpModal(rental.id)}
    className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
  >
     Verify Pickup OTP
  </button>
)}

{rental.isPickedUp && (
  <span className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 rounded-lg">
     Picked Up
  </span>
)}


                          {rental.status === 'RETURNING' && (
                            <div className="or-actions">
                              <button className="or-btn or-btn-complete" onClick={() => handleRequest(rental.id, 'complete')}>
                                <IconCheck /> Complete
                              </button>
                              <button className="or-btn or-btn-minor" onClick={() => { setDamageModal({ rentalId: rental.id, type: 'minor' }); setError(''); }}>
                                <IconWarning /> Minor Damage
                              </button>
                              <button className="or-btn or-btn-major" onClick={() => { setDamageModal({ rentalId: rental.id, type: 'major' }); setError(''); }}>
                                <IconDanger /> Major Damage
                              </button>
                            </div>
                          )}

                          {rental.status === 'PENDING_REVIEW' && (
                            <span className="or-review-chip">
                              <IconClock /> Admin Review Pending
                            </span>
                          )}
                        </div>

                        {/* Damage report */}
                        {rental.isDamaged && rental.damageReport && (
                          <div className="or-dmg-report">
                            <p className="or-dmg-report-title">Damage Report</p>
                            <p className="or-dmg-report-text">{rental.damageReport}</p>
                            {rental.damageAmount && (
                              <p className="or-dmg-report-amt">Damage Amount: ₹{rental.damageAmount}</p>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


{otpModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Pickup OTP</h3>
      <p className="text-sm text-gray-500 mb-4">
        Take OTP from the renter and verify it
      </p>

      {/* 4 boxes */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
        {[0, 1, 2, 3].map(i => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={pickupOtp[i] || ''}
            onChange={e => {
              const val = e.target.value.replace(/\D/, '');
              const arr = pickupOtp.split('');
              arr[i] = val;
              setPickupOtp(arr.join(''));
              if (val && i < 3) document.getElementById(`otp-${i + 1}`).focus();
            }}
            onKeyDown={e => {
              if (e.key === 'Backspace' && !pickupOtp[i] && i > 0)
                document.getElementById(`otp-${i - 1}`).focus();
            }}
            style={{
              width: 56, height: 60,
              textAlign: 'center', fontSize: 24, fontWeight: 700,
              border: '1.5px solid #E5E7EB', borderRadius: 12,
              outline: 'none', letterSpacing: 0,
              background: pickupOtp[i] ? '#EEF2FF' : '#F9FAFB',
              borderColor: pickupOtp[i] ? '#6366F1' : '#E5E7EB',
              color: '#111827', transition: 'all 0.15s',
            }}
          />
        ))}
      </div>

      {otpError && (
        <p className="text-red-500 text-sm mb-3">{otpError}</p>
      )}
      <div className="flex flex-col gap-2">
        <button
          onClick={handlePickupVerify}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
        >
          Verify OTP
        </button>
        <button
          onClick={() => { setOtpModal(null); setPickupOtp(''); setOtpError(''); }}
          className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* Damage Modal */}
      {damageModal && (
        <div className="or-overlay" onClick={closeModal}>
          <div className="or-modal" onClick={e => e.stopPropagation()}>
            <div
              className="or-modal-bar"
              style={{
                background: damageModal.type === 'minor'
                  ? 'linear-gradient(90deg,#F59E0B,#D97706)'
                  : 'linear-gradient(90deg,#EF4444,#DC2626)'
              }}
            />

            <h3 className="or-modal-title">
              {damageModal.type === 'minor' ? 'Minor Damage Report' : 'Major Damage Report'}
            </h3>
            <p className="or-modal-sub">
              {damageModal.type === 'minor'
                ? 'Partial deposit will be deducted based on the amount you specify.'
                : 'Full deposit will be retained to cover the damage.'}
            </p>

            {error && <div className="or-alert or-alert-error" style={{marginBottom:16}}><IconDanger />{error}</div>}

            <div className="or-field">
              <label className="or-field-label">Damage Description *</label>
              <textarea
                placeholder="Describe the damage in detail..."
                value={damageForm.report}
                onChange={e => setDamageForm({ ...damageForm, report: e.target.value })}
                rows={3}
                className="or-input"
              />
            </div>

            {damageModal.type === 'minor' && (
              <div className="or-field">
                <label className="or-field-label">Damage Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={damageForm.amount}
                  onChange={e => setDamageForm({ ...damageForm, amount: e.target.value })}
                  className="or-input"
                />
              </div>
            )}

            <div className="or-field">
              <label className="or-field-label">Damage Photos * <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,color:'#C4C8D4'}}>(max 3)</span></label>
              {photoPreviews.length > 0 && (
                <div className="or-photo-previews">
                  {photoPreviews.map((src, i) => (
                    <img key={i} src={src} className="or-photo-thumb" alt={`damage ${i+1}`} />
                  ))}
                </div>
              )}
              <label className="or-upload-zone">
                <input type="file" multiple accept="image/*" onChange={handlePhotoChange} />
                <IconUpload />
                <p className="or-upload-label">Click to upload damage photos</p>
              </label>
            </div>

            <div className="or-modal-btns">
              <button
                className="or-modal-submit"
                style={{
                  background: damageModal.type === 'minor'
                    ? 'linear-gradient(135deg,#F59E0B,#D97706)'
                    : 'linear-gradient(135deg,#EF4444,#DC2626)'
                }}
                onClick={handleDamageSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button className="or-modal-cancel" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerRentals;
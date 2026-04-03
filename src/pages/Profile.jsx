import { useState, useEffect } from 'react';
import { getProfile, updateProfile, updateLocation, submitKYC, getMyKYC } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ upiId: '', city: '', area: '', phoneNumber: '' });
  const [kyc, setKyc] = useState(null);
  const [kycForm, setKycForm] = useState({ documentType: '', documentNumber: '' });
  const [kycFiles, setKycFiles] = useState({ doc: null, selfie: null });
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [upiEditMode, setUpiEditMode] = useState(false);
  const [phoneEditMode, setPhoneEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locError, setLocError] = useState('');
  const [locSuccess, setLocSuccess] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    getProfile().then(res => {
      setProfile(res.data);
      setForm({
        upiId: res.data.upiId || '',
        city: res.data.city || '',
        area: res.data.area || '',
        phoneNumber: res.data.phoneNumber || '',
      });
      setUpiEditMode(!res.data.upiId);
      setPhoneEditMode(!res.data.phoneNumber);
    });
    getMyKYC().then(res => setKyc(res.data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    setError(''); setSuccess(''); setLocError(''); setLocSuccess('');
  }, [tab]);

  const handleSaveUPI = async () => {
    if (!form.upiId?.trim()) return setError('UPI ID is required.');
    const upiRegex = /^[\w.\-]+@[\w.\-]+$/;
    if (!upiRegex.test(form.upiId.trim())) return setError('Please enter a valid UPI ID (e.g. name@upi, 9876543210@paytm)');
    setLoading(true); setError('');
    try {
      const res = await updateProfile({ upiId: form.upiId.trim() });
      setProfile(res.data); setUpiEditMode(false);
      setSuccess('UPI ID saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving profile.');
    } finally { setLoading(false); }
  };

  const handlePhoneSave = async () => {
    if (!form.phoneNumber?.trim()) return setError('Phone number is required.');
    if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) return setError('Enter a valid 10-digit Indian phone number.');
    setLoading(true); setError('');
    try {
          const res = await updateProfile({ phoneNumber: form.phoneNumber.trim() })
          setProfile(res.data);
      setSaved(true); setPhoneEditMode(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Error saving phone number.');
    } finally { setLoading(false); }
  };

  const handleSaveLocation = async () => {
    setLocLoading(true); setLocError('');
    try {
      const res = await updateProfile({ city: form.city, area: form.area });
      setProfile(res.data);
      setLocSuccess('Location saved successfully!');
      setTimeout(() => setLocSuccess(''), 3000);
    } catch (err) {
      setLocError(err.response?.data?.message || 'Error saving location.');
    } finally { setLoading(false); }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return setLocError('Geolocation not supported by your browser.');
    setLocLoading(true); setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const locationData = {
            city: data.address.city || data.address.town || data.address.village || '',
            area: data.address.suburb || data.address.neighbourhood || data.address.county || '',
            latitude, longitude,
          };
          setForm(prev => ({ ...prev, ...locationData }));
          await updateLocation(locationData);
          setLocSuccess('Location detected and saved!');
          setTimeout(() => setLocSuccess(''), 3000);
        } catch { setLocError('Could not detect location. Please enter manually.'); }
        finally { setLocLoading(false); }
      },
      () => { setLocError('Location access denied. Please enter manually.'); setLocLoading(false); }
    );
  };

  const handleKYCSubmit = async () => {
    if (!kycForm.documentType) return setError('Please select a document type.');
    if (!kycForm.documentNumber.trim()) return setError('Please enter your document number.');
    if (!kycFiles.doc) return setError('Please upload your document photo.');
    if (!kycFiles.selfie) return setError('Please upload your selfie.');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;
    if (!allowedTypes.includes(kycFiles.doc.type)) return setError('Document photo must be JPEG or PNG.');
    if (kycFiles.doc.size > maxSize) return setError('Document photo must be under 5MB.');
    if (!allowedTypes.includes(kycFiles.selfie.type)) return setError('Selfie must be JPEG or PNG.');
    if (kycFiles.selfie.size > maxSize) return setError('Selfie must be under 5MB.');
    setKycLoading(true); setError('');
    const data = new FormData();
    data.append('documentType', kycForm.documentType);
    data.append('documentNumber', kycForm.documentNumber.trim());
    data.append('document', kycFiles.doc);
    data.append('selfie', kycFiles.selfie);
    try {
      const res = await submitKYC(data);
      setKyc(res.data);
      setSuccess("KYC submitted! We'll review within 24\u201348 hours.");
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting KYC.');
    } finally { setKycLoading(false); }
  };

  const kycStatusConfig = {
    PENDING: { icon: '⏳', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Under Review', desc: 'Your documents are being reviewed. This usually takes 24–48 hours.' },
    VERIFIED: { icon: '✓', color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'Verified', desc: 'Your identity has been verified successfully.' },
    REJECTED: { icon: '✕', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'Rejected', desc: 'Your documents were not accepted. Please resubmit with clearer images.' },
  };

  if (!profile) return (
    <div style={styles.loadingScreen}>
      <div style={styles.spinner} />
    </div>
  );

  const tabIcons = { profile: '◈', location: '⊕', kyc: '◉' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

        .profile-root {
          min-height: 100vh;
          background: #F5F6FA;
          padding-top: 80px;
          font-family: 'DM Sans', sans-serif;
          background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 60%);
        }

        .profile-inner {
          max-width: 640px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }

        /* Hero Header */
        .profile-hero {
          position: relative;
          background: #fff;
          border: 1px solid #E8EAF0;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(99,102,241,0.06);
        }
        .profile-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366F1, #8B5CF6, #6366F1);
        }
        .profile-hero-glow {
          position: absolute;
          top: -40px; right: -40px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-content { display: flex; align-items: center; gap: 20px; position: relative; }

        .avatar {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(99,102,241,0.3);
        }

        .hero-name {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 700;
          color: #111827;
          letter-spacing: -0.3px;
          margin: 0 0 4px;
        }
        .hero-email { font-size: 13px; color: #9CA3AF; margin: 0 0 12px; }

        .badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
          border: 1px solid;
        }
        .badge-kyc-ok { color: #059669; border-color: #A7F3D0; background: #ECFDF5; }
        .badge-kyc-no { color: #9CA3AF; border-color: #E5E7EB; background: #F9FAFB; }
        .badge-role { color: #6366F1; border-color: #C7D2FE; background: #EEF2FF; text-transform: capitalize; }

        /* Tabs */
        .tab-bar {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          background: #EDEDF5;
          border: 1px solid #E0E2EE;
          padding: 5px;
          border-radius: 16px;
          margin-bottom: 24px;
        }
        .tab-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 16px;
          border: none; background: none; cursor: pointer;
          border-radius: 11px;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #9CA3AF;
          transition: all 0.2s ease;
          letter-spacing: 0.2px;
        }
        .tab-btn:hover { color: #6366F1; background: rgba(99,102,241,0.06); }
        .tab-btn.active {
          background: #fff;
          color: #4F46E5;
          border: 1px solid #E0E7FF;
          box-shadow: 0 1px 6px rgba(99,102,241,0.1);
        }
        .tab-icon { font-size: 15px; opacity: 0.8; }

        /* Card */
        .card {
          background: #fff;
          border: 1px solid #E8EAF0;
          border-radius: 24px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(99,102,241,0.05);
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6366F1, #8B5CF6);
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 700;
          color: #111827;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }
        .card-subtitle { font-size: 13px; color: #9CA3AF; margin: 0 0 24px; line-height: 1.5; }

        /* Field */
        .field { margin-bottom: 20px; }
        .field-label {
          display: block;
          font-size: 11px; font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .field-hint { font-size: 11px; color: #C4C8D4; margin-top: 6px; }

        .input-field {
          width: 100%;
          padding: 13px 18px;
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
          color: #111827;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .input-field::placeholder { color: #C4C8D4; }
        .input-field:focus {
          border-color: #6366F1;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.08);
        }

        select.input-field option { background: #fff; color: #111827; }

        .display-field {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 18px;
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
        }
        .display-value { font-size: 14px; color: #111827; font-weight: 500; }
        .change-btn {
          font-size: 12px; font-weight: 700;
          color: #6366F1; cursor: pointer;
          background: none; border: none;
          padding: 4px 10px;
          border-radius: 8px;
          transition: background 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .change-btn:hover { background: #EEF2FF; }

        /* Primary button */
        .btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%);
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.3px;
          border: none; border-radius: 14px; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
          margin-top: 8px;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(99,102,241,0.4); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* GPS card */
        .gps-card {
          background: #EEF2FF;
          border: 1px solid #C7D2FE;
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 20px;
        }
        .gps-title { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .gps-title-text {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #4F46E5;
        }
        .gps-desc { font-size: 12px; color: #818CF8; margin-bottom: 14px; }

        /* Alerts */
        .alert {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 16px;
          border: 1px solid;
          display: flex; align-items: center; gap: 10px;
        }
        .alert-error { background: #FEF2F2; border-color: #FECACA; color: #DC2626; }
        .alert-success { background: #ECFDF5; border-color: #A7F3D0; color: #059669; }

        /* KYC status */
        .kyc-status {
          border-radius: 18px;
          padding: 28px;
          text-align: center;
          border: 1px solid;
        }
        .kyc-status-icon { font-size: 36px; margin-bottom: 12px; }
        .kyc-status-label {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800;
          margin-bottom: 8px;
        }
        .kyc-status-desc { font-size: 13px; opacity: 0.7; line-height: 1.5; }

        /* File input */
        .file-input-wrapper {
          position: relative;
          background: #F9FAFB;
          border: 1.5px dashed #D1D5DB;
          border-radius: 14px;
          padding: 18px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .file-input-wrapper:hover { border-color: #6366F1; background: #EEF2FF; }
        .file-input-wrapper input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
        .file-label { font-size: 13px; color: #9CA3AF; }
        .file-label strong { color: #6366F1; display: block; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; text-transform: uppercase; }
        .file-chosen { font-size: 12px; color: #059669; margin-top: 4px; }

        /* Divider */
        .divider { height: 1px; background: #F3F4F6; margin: 24px 0; }

        /* Loading */
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      <div className="profile-root">
        <div className="profile-inner">

          {/* Hero Header */}
          <div className="profile-hero">
            <div className="profile-hero-glow" />
            <div className="hero-content">
              <div className="avatar">
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="hero-name">{profile?.name}</h1>
                <p className="hero-email">{profile?.email}</p>
                <div className="badges">
                  <span className={`badge ${profile?.kycVerified ? 'badge-kyc-ok' : 'badge-kyc-no'}`}>
                    {profile?.kycVerified ? '✓ Verified' : '○ KYC Pending'}
                  </span>
                  <span className="badge badge-role">{profile?.role?.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="tab-bar">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'location', label: 'Location' },
              { id: 'kyc', label: 'KYC' },
            ].map(t => (
              <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <span className="tab-icon">{tabIcons[t.id]}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="card fade-in">
              <h2 className="card-title">User Details</h2>
              <p className="card-subtitle">Manage your contact and payment information</p>

              {error && <div className="alert alert-error">⚠ {error}</div>}
              {success && <div className="alert alert-success">✓ {success}</div>}

              {/* Phone */}
              <div className="field">
                <label className="field-label">Phone Number</label>
                {phoneEditMode ? (
                  <>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={form.phoneNumber || ''}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="input-field"
                    />
                    <button
                      onClick={handlePhoneSave}
                      disabled={loading || !form.phoneNumber || form.phoneNumber.length < 10}
                      className="btn-primary"
                      style={{ marginTop: 12 }}
                    >
                      {saved ? '✓ Saved!' : loading ? 'Saving…' : 'Save Phone Number'}
                    </button>
                  </>
                ) : (
                  <div className="display-field">
                    <span className="display-value">{form.phoneNumber || <span style={{ color: 'rgba(241,241,246,0.25)' }}>Not set</span>}</span>
                    <button className="change-btn" onClick={() => setPhoneEditMode(true)}>Change</button>
                  </div>
                )}
                <p className="field-hint">Required for contact & booking updates</p>
              </div>

              <div className="divider" />

              {/* UPI */}
              <div className="field">
                <label className="field-label">UPI ID</label>
                {upiEditMode ? (
                  <>
                    <input
                      placeholder="yourname@upi or 9876543210@paytm"
                      value={form.upiId}
                      onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                      className="input-field"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveUPI}
                      disabled={loading || !form.upiId || !form.upiId.includes('@')}
                      className="btn-primary"
                      style={{ marginTop: 12 }}
                    >
                      {loading ? 'Saving…' : 'Save UPI ID'}
                    </button>
                  </>
                ) : (
                  <div className="display-field">
                    <span className="display-value">{form.upiId}</span>
                    <button className="change-btn" onClick={() => { setUpiEditMode(true); setError(''); setSuccess(''); }}>Change</button>
                  </div>
                )}
                <p className="field-hint">Required to receive rental payments from renters</p>
              </div>
            </div>
          )}

          {/* Location Tab */}
          {tab === 'location' && (
            <div className="card fade-in">
              <h2 className="card-title">Your Location</h2>
              <p className="card-subtitle">City and area appear on your listings. GPS coordinates are only shared after rental confirmation.</p>

              {locError && <div className="alert alert-error">⚠ {locError}</div>}
              {locSuccess && <div className="alert alert-success">✓ {locSuccess}</div>}

              <div className="field">
                <label className="field-label">City</label>
                <input
                  placeholder="e.g. Delhi, Mumbai, Bangalore"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="field">
                <label className="field-label">Area / Locality</label>
                <input
                  placeholder="e.g. Connaught Place, Bandra West"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="gps-card">
                <div className="gps-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="gps-title-text">Auto-detect Location</span>
                </div>
                <p className="gps-desc">Fill city and area automatically from your current GPS position.</p>
                <button onClick={handleDetectLocation} disabled={locLoading} className="btn-primary" style={{ marginTop: 0 }}>
                  {locLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Detecting…
                    </span>
                  ) : 'Use Current Location'}
                </button>
              </div>

              <button onClick={handleSaveLocation} disabled={loading} className="btn-primary">
                {loading ? 'Saving…' : 'Save Location'}
              </button>
            </div>
          )}

          {/* KYC Tab */}
          {tab === 'kyc' && (
            <div className="card fade-in">
              <h2 className="card-title">KYC Verification</h2>
              <p className="card-subtitle">Verify your identity to build trust and unlock all features. JPEG/PNG images only, max 5MB each.</p>

              {error && <div className="alert alert-error">⚠ {error}</div>}
              {success && <div className="alert alert-success">✓ {success}</div>}

              {kyc ? (
                <>
                  <div
                    className="kyc-status"
                    style={{
                      background: kycStatusConfig[kyc.verificationStatus]?.bg,
                      borderColor: kycStatusConfig[kyc.verificationStatus]?.border,
                      color: kycStatusConfig[kyc.verificationStatus]?.color,
                    }}
                  >
                    <div className="kyc-status-icon">{kycStatusConfig[kyc.verificationStatus]?.icon}</div>
                    <p className="kyc-status-label">{kycStatusConfig[kyc.verificationStatus]?.label}</p>
                    <p className="kyc-status-desc">{kycStatusConfig[kyc.verificationStatus]?.desc}</p>
                  </div>
                  {kyc.verificationStatus === 'REJECTED' && (
                    <button onClick={() => setKyc(null)} className="btn-primary" style={{ marginTop: 16 }}>
                      ↺ Resubmit KYC
                    </button>
                  )}
                </>
              ) : (
                <div>
                  <div className="field">
                    <label className="field-label">Document Type</label>
                    <select
                      value={kycForm.documentType}
                      onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select document type</option>
                      <option value="aadhar">Aadhar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">Document Number</label>
                    <input
                      placeholder="Enter your document number"
                      value={kycForm.documentNumber}
                      onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Document Photo</label>
                    <div className="file-input-wrapper">
                      <input type="file" accept="image/*" onChange={(e) => setKycFiles({ ...kycFiles, doc: e.target.files[0] })} />
                      <div className="file-label">
                        <strong>Click to upload</strong>
                        {kycFiles.doc ? <span className="file-chosen">✓ {kycFiles.doc.name}</span> : 'JPEG or PNG, max 5MB'}
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Selfie with Document</label>
                    <div className="file-input-wrapper">
                      <input type="file" accept="image/*" onChange={(e) => setKycFiles({ ...kycFiles, selfie: e.target.files[0] })} />
                      <div className="file-label">
                        <strong>Click to upload</strong>
                        {kycFiles.selfie ? <span className="file-chosen">✓ {kycFiles.selfie.name}</span> : 'JPEG or PNG, max 5MB'}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleKYCSubmit} disabled={kycLoading} className="btn-primary">
                    {kycLoading ? 'Submitting…' : 'Submit KYC'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#F5F6FA',
  },
  spinner: {
    width: 32, height: 32,
    border: '3px solid #E0E2EE',
    borderTopColor: '#6366F1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default Profile;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/api';
import API from '../services/api';

const MAX_IMAGES = 4;

const AddItem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: '', description: '', pricePerDay: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    API.get('/categories')
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > MAX_IMAGES) return setError(`Maximum ${MAX_IMAGES} images allowed.`);
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) return setError('Each image must be under 5MB.');
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
    setError('');
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return setError('Please upload at least 1 photo.');
    if (Number(form.pricePerDay) < 1) return setError('Price must be at least \u20B91/day.');
    if (Number(form.pricePerDay) > 4000) return setError('Price cannot exceed \u20B94,000/day.');
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      images.forEach(img => data.append('images', img));
      await createItem(data);
      navigate('/my-items');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

        .ai-root {
          min-height: 100vh;
          background: #F5F6FA;
          padding-top: 80px;
          font-family: 'DM Sans', sans-serif;
          background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 60%);
        }

        .ai-inner {
          max-width: 640px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }

        /* Page header */
        .ai-page-header {
          margin-bottom: 28px;
          animation: fadeUp 0.4s ease forwards;
        }
        .ai-page-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #111827;
          letter-spacing: -0.5px;
          margin: 0 0 4px;
        }
        .ai-page-sub {
          font-size: 14px;
          color: #9CA3AF;
          margin: 0;
        }

        /* Card */
        .ai-card {
          background: #fff;
          border: 1px solid #E8EAF0;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 2px 16px rgba(99,102,241,0.05);
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.4s ease 0.05s both;
        }
        .ai-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6366F1, #8B5CF6);
        }

        /* Section label */
        .ai-section-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin: 0 0 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .ai-section-label::after {
          content: '';
          flex: 1; height: 1px;
          background: #F3F4F6;
        }

        /* Field */
        .ai-field { margin-bottom: 20px; }
        .ai-label {
          display: block;
          font-size: 11px; font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .ai-label span { font-weight: 400; color: #C4C8D4; text-transform: none; letter-spacing: 0; }
        .ai-hint { font-size: 11px; color: #C4C8D4; margin-top: 6px; }
        .ai-hint-right { font-size: 11px; color: #C4C8D4; margin-top: 6px; text-align: right; }

        .ai-input {
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
        .ai-input::placeholder { color: #C4C8D4; }
        .ai-input:focus {
          border-color: #6366F1;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.08);
        }
        select.ai-input option { background: #fff; color: #111827; }
        textarea.ai-input { resize: none; line-height: 1.6; }

        /* Price input */
        .ai-price-wrap { position: relative; }
        .ai-price-symbol {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #6366F1;
          pointer-events: none;
        }
        .ai-price-input {
          padding-left: 32px;
          appearance: textfield;
        }
        .ai-price-input::-webkit-outer-spin-button,
        .ai-price-input::-webkit-inner-spin-button { appearance: none; }

        /* Image upload zone */
        .ai-upload-zone {
          width: 100%;
          border: 1.5px dashed #D1D5DB;
          border-radius: 16px;
          padding: 28px 20px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: #F9FAFB;
          position: relative;
          text-align: center;
        }
        .ai-upload-zone:hover { border-color: #6366F1; background: #EEF2FF; }
        .ai-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
        .ai-upload-icon {
          width: 44px; height: 44px;
          background: #EEF2FF;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
        }
        .ai-upload-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #4F46E5;
          margin-bottom: 4px;
        }
        .ai-upload-sub { font-size: 12px; color: #9CA3AF; }

        /* Image previews */
        .ai-previews {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }
        .ai-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid #E5E7EB;
          background: #F3F4F6;
        }
        .ai-preview-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ai-preview-remove {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transition: opacity 0.15s;
          cursor: pointer;
          border: none;
        }
        .ai-preview-item:hover .ai-preview-remove { opacity: 1; }
        .ai-preview-badge {
          position: absolute; bottom: 6px; left: 6px;
          background: rgba(0,0,0,0.55);
          color: #fff;
          font-size: 10px; font-weight: 600;
          padding: 2px 7px;
          border-radius: 100px;
          font-family: 'Syne', sans-serif;
        }

        /* Image count indicator */
        .ai-img-count {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 12px;
        }
        .ai-img-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #E5E7EB;
          transition: background 0.2s;
        }
        .ai-img-dot.filled { background: #6366F1; }

        /* Alert */
        .ai-alert {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 20px;
          border: 1px solid #FECACA;
          background: #FEF2F2;
          color: #DC2626;
          display: flex; align-items: center; gap: 10px;
        }

        /* Divider */
        .ai-divider { height: 1px; background: #F3F4F6; margin: 24px 0; }

        /* Submit button */
        .ai-submit {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6366F1 0%, #7C3AED 100%);
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: 0.3px;
          border: none; border-radius: 14px; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px;
        }
        .ai-submit:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.4);
        }
        .ai-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* Earnings preview chip */
        .ai-earn-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 100px;
          font-size: 12px; font-weight: 600;
          color: #059669;
          font-family: 'Syne', sans-serif;
          margin-top: 10px;
          transition: opacity 0.2s;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="ai-root">
        <div className="ai-inner">

          {/* Page Header */}
          <div className="ai-page-header">
            <h1 className="ai-page-title">List an Item</h1>
            <p className="ai-page-sub">Share your item with the community and start earning</p>
          </div>

          <div className="ai-card">

            {error && (
              <div className="ai-alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Photos */}
              <p className="ai-section-label">Photos</p>

              {/* Dot indicators */}
              <div className="ai-img-count">
                {Array.from({ length: MAX_IMAGES }).map((_, i) => (
                  <div key={i} className={`ai-img-dot ${i < previews.length ? 'filled' : ''}`} />
                ))}
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>
                  {previews.length}/{MAX_IMAGES} uploaded
                </span>
              </div>

              {previews.length > 0 && (
                <div className="ai-previews">
                  {previews.map((src, i) => (
                    <div className="ai-preview-item" key={i}>
                      <img src={src} alt={`Preview ${i + 1}`} />
                      {i === 0 && <span className="ai-preview-badge">Cover</span>}
                      <button type="button" className="ai-preview-remove" onClick={() => removeImage(i)} aria-label="Remove">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {previews.length < MAX_IMAGES && (
                <label className="ai-upload-zone" style={{ marginBottom: 20 }}>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                  <div className="ai-upload-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p className="ai-upload-title">Click to upload photos</p>
                  <p className="ai-upload-sub">JPG, PNG — max 5MB each</p>
                </label>
              )}

              <div className="ai-divider" />

              {/* Item Details */}
              <p className="ai-section-label">Item Details</p>

              <div className="ai-field">
                <label className="ai-label">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Canon DSLR Camera, Mountain Bike"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={100}
                  className="ai-input"
                />
              </div>

              <div className="ai-field">
                <label className="ai-label">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  className="ai-input"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="ai-field">
                <label className="ai-label">Description <span>(optional)</span></label>
                <textarea
                  placeholder="Describe your item — condition, features, accessories included..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  maxLength={1000}
                  className="ai-input"
                />
                <p className="ai-hint-right">{form.description.length}/1000</p>
              </div>

              <div className="ai-divider" />

              {/* Pricing */}
              <p className="ai-section-label">Pricing</p>

              <div className="ai-field">
                <label className="ai-label">Price per Day</label>
                <div className="ai-price-wrap">
                  <span className="ai-price-symbol">&#8377;</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.pricePerDay}
                    onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                    required
                    min="1"
                    max="4000"
                    className="ai-input ai-price-input"
                  />
                </div>
                <p className="ai-hint">Maximum &#8377;4,000/day</p>

                {/* Live earnings preview */}
                {form.pricePerDay && Number(form.pricePerDay) >= 1 && (
                  <div className="ai-earn-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                    </svg>
                    Est. &#8377;{(Number(form.pricePerDay) * 30).toLocaleString('en-IN')} / month if rented daily
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="ai-submit">
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Uploading...
                  </>
                ) : 'List Item'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddItem;
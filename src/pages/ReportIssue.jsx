import { useState } from 'react';
import { submitReport } from '../services/api';

const ISSUE_TYPES = [
  'Payment Issue',
  'Item Not Available',
  'Owner Not Responding',
  'Wrong Item Delivered',
  'Refund Not Received',
  'Account Issue',
  'App Bug',
  'Other'
];

const IconDanger = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ReportIssue = () => {
  const [type, setType]               = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess]         = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async () => {
    if (!type || !description) return setError('All fields are required.');
    setLoading(true);
    setError('');
    try {
      await submitReport({ type, description });
      setSuccess('Report submitted successfully!');
      setType('');
      setDescription('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F6FA', paddingTop: 80, fontFamily: "'Inter', sans-serif",
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.06) 0%, transparent 60%)' }}>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', margin: '0 0 4px' }}>
            Report an Issue
          </h1>
          <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>
            Let us know about any problem you're facing
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
            background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
            <IconDanger /> {error}
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
            background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: 13, marginBottom: 16 }}>
            <IconCheck /> {success}
          </div>
        )}

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #E8EAF0', borderRadius: 20, padding: 24,
          boxShadow: '0 2px 12px rgba(99,102,241,0.04)', position: 'relative', overflow: 'hidden' }}>

          {/* Left accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
            background: 'linear-gradient(180deg, #6366F1, #8B5CF6)', borderRadius: '20px 0 0 20px' }} />

          <div style={{ paddingLeft: 8 }}>

            {/* Issue Type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                Issue Type *
              </label>
              <select
                value={type}
                onChange={e => { setType(e.target.value); setError(''); }}
                style={{ width: '100%', padding: '12px 16px', background: '#F9FAFB',
                  border: `1.5px solid ${type ? '#6366F1' : '#E5E7EB'}`,
                  borderRadius: 12, color: type ? '#111827' : '#9CA3AF',
                  fontSize: 14, fontFamily: "'Inter', sans-serif",
                  outline: 'none', appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                  cursor: 'pointer' }}
              >
                <option value="">Select issue type</option>
                {ISSUE_TYPES.map(issue => (
                  <option key={issue} value={issue}>{issue}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                Description *
              </label>
              <textarea
                value={description}
                onChange={e => { setDescription(e.target.value); setError(''); }}
                placeholder="Describe your issue in detail..."
                rows={5}
                style={{ width: '100%', padding: '12px 16px', background: '#F9FAFB',
                  border: `1.5px solid ${description ? '#6366F1' : '#E5E7EB'}`,
                  borderRadius: 12, color: '#111827',
                  fontSize: 14, fontFamily: "'Inter', sans-serif",
                  outline: 'none', resize: 'none', lineHeight: 1.6 }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: 13, border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
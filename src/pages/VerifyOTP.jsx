import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyOTP } from '../services/api';

const VerifyOTP = () => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = location.state?.email;
  const type  = location.state?.type;
  const otp   = digits.join('');

  const handleChange = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    setError('');
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return setError('6 digit OTP enter karo');
    setLoading(true);
    try {
      if (!email) return navigate('/forgot-password');
      if (type === 'forgot_password') {
        navigate('/reset-password', { state: { email, otp } });
      } else {
        const res = await verifyOTP({ email, otp });
        login(res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setDigits(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* Icon */}
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Verify Email</h2>
          <p className="text-sm text-gray-400 text-center mb-1">OTP sent</p>
          <p className="text-sm font-medium text-blue-600 text-center mb-7 truncate">{email}</p>

          {/* OTP Boxes */}
          <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                style={{
                  width: 44, height: 52,
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  borderRadius: 12,
                  border: error
                    ? '1.5px solid #fca5a5'
                    : d
                    ? '1.5px solid #3b82f6'
                    : '1.5px solid #e5e7eb',
                  background: error ? '#fef2f2' : d ? '#eff6ff' : '#f9fafb',
                  color: error ? '#dc2626' : '#1e3a5f',
                  outline: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Verifying…
              </>
            ) : 'Verify OTP'}
          </button>

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
         Didn’t receive the OTP? Check your spam folder.
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
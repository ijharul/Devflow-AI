import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';

function pwScore(pw) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#f87171', '#fbbf24', '#60a5fa', '#34d399'];

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const score = useMemo(() => pwScore(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page" style={{ justifyContent: 'center' }}>
      <div className="auth-right-panel" style={{ width: '100%', maxWidth: 480 }}>
        <div className="auth-form-container" style={{ width: '100%' }}>
          <div className="auth-form-header">
            <h1 className="auth-form-title">Reset <span style={{ color: '#7c3aed' }}>Password</span></h1>
            <p className="auth-form-subtitle">Choose a strong password to secure your account</p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Success!</h2>
              <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem' }}>Your password has been updated. Redirecting to login...</p>
              <Link to="/login" className="auth-footer-link">Go to Login manually</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error-banner" style={{ marginBottom: '1.5rem' }}>
                  {error}
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label">New Password</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="auth-input"
                    style={{ paddingRight: '2.75rem' }}
                    required
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div className="auth-strength-bar">
                      {[1,2,3,4].map(i => (
                        <span key={i} style={{
                          flex: 1, height: '3px', borderRadius: 99,
                          background: i <= score ? STRENGTH_COLORS[score] : 'var(--border)',
                          transition: 'background 0.3s ease',
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.68rem', marginTop: '0.2rem', color: STRENGTH_COLORS[score], fontWeight: 600 }}>
                      {STRENGTH_LABELS[score]}
                    </p>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirm New Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="auth-input"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name  = params.get('name');
    const email = params.get('email');
    const id    = params.get('id');

    if (token && name && email && id) {
      loginWithToken(token, { id, name, email });
      navigate('/', { replace: true });
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [loginWithToken, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <span className="spinner spinner-lg" />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Signing you in…</p>
    </div>
  );
}

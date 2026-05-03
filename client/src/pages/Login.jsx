import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);
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

/* ─── Forgot Password Modal ─── */
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) { setErrMsg('Enter a valid email address'); return; }
    setErrMsg('');
    setStatus('loading');
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setStatus('sent');
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'linear-gradient(160deg, #0f1225, #0a0d1f)',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: 18,
        padding: '2.25rem',
        width: '100%', maxWidth: 440,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
        animation: 'fadeUp 0.3s cubic-bezier(0.34,1.3,0.64,1) both',
        position: 'relative',
      }}>
        {/* Close btn */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
          borderRadius: 8, width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-3)', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#eef2ff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-3)'; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Icon */}
        <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        {status === 'sent' ? (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eef2ff', marginBottom: '0.5rem' }}>Check your email</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              We've sent a password reset link to <strong style={{ color: '#c4b5fd' }}>{email}</strong>. Check your inbox and follow the instructions.
            </p>
            <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize: '0.8rem', color: '#34d399' }}>Reset link sent successfully</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>
              Didn't receive it? Check spam or{' '}
              <button onClick={() => setStatus('idle')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: '0.75rem' }}>
                try again
              </button>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eef2ff', marginBottom: '0.375rem' }}>Reset your password</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            {errMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.8rem', color: '#fca5a5', marginBottom: '1rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errMsg}
              </div>
            )}

            <div className="auth-field" style={{ marginBottom: '1.25rem' }}>
              <label className="auth-label">Email address</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrMsg(''); }}
                  placeholder="you@example.com"
                  autoFocus
                  className="auth-input"
                  style={{ borderColor: errMsg ? 'rgba(239,68,68,0.5)' : undefined }}
                />
              </div>
            </div>

            <button type="submit" disabled={status === 'loading'} className="auth-submit-btn">
              {status === 'loading' ? (
                <><span className="auth-spinner" /> Sending reset link…</>
              ) : (
                <>
                  Send reset link
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const TYPING_SNIPPETS = [
  { title: 'system_design.js', code: `import { AI } from '@devflow/core';\n\n// Generate microservices instantly\nconst architecture = await AI.generate({\n  project: 'E-commerce Platform',\n  scale: 'Global'\n});\n\n// Deploy directly to AWS\narchitecture.deploy();` },
  { title: 'devops_pipeline.yaml', code: `name: Production Deploy\n\non:\n  push:\n    branches: [ "main" ]\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm install\n      - run: npm run build\n      - run: npm run deploy` },
  { title: 'error_debugger.js', code: `import { Debugger } from '@devflow/ai';\n\ntry {\n  await connectDB();\n} catch (err) {\n  // AI analyzes and fixes the root cause\n  const fix = await Debugger.analyze(err);\n  console.log("Root Cause:", fix.reason);\n  await fix.applyPatch();\n}` }
];

const DynamicMockup = () => {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    let currentText = '';
    const targetCode = TYPING_SNIPPETS[snippetIdx].code;
    let i = 0;
    let timer;

    const type = () => {
      if (i < targetCode.length) {
        currentText += targetCode.charAt(i);
        setText(currentText);
        i++;
        timer = setTimeout(type, Math.random() * 20 + 15);
      } else {
        setIsTyping(false);
        timer = setTimeout(() => {
          setText('');
          setIsTyping(true);
          setSnippetIdx((prev) => (prev + 1) % TYPING_SNIPPETS.length);
        }, 3000);
      }
    };
    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [snippetIdx]);

  return (
    <div className="auth-mockup" style={{
      background: 'rgba(10, 13, 31, 0.65)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderTopColor: 'rgba(255,255,255,0.2)',
      borderRadius: 16,
      padding: '1.25rem',
      boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
      transform: 'rotate(-2deg) scale(0.98)',
      transition: 'transform 0.4s ease, box-shadow 0.4s ease',
      position: 'relative', zIndex: 2,
      marginTop: '2rem', marginBottom: '2rem',
      height: 230,
      display: 'flex', flexDirection: 'column'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(0deg) scale(1)'; e.currentTarget.style.boxShadow = '0 40px 80px rgba(0,0,0,0.6), 0 0 0 2px rgba(124, 58, 237, 0.2)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(-2deg) scale(0.98)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'; }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{width:10,height:10,borderRadius:'50%',background:'#ff5f57'}} />
        <div style={{width:10,height:10,borderRadius:'50%',background:'#febc2e'}} />
        <div style={{width:10,height:10,borderRadius:'50%',background:'#28c840'}} />
        <span style={{marginLeft: 8, fontSize: '0.75rem', color: 'var(--text-4)', fontFamily: 'monospace'}}>
          {TYPING_SNIPPETS[snippetIdx].title}
        </span>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ paddingRight: '1rem', color: 'rgba(255,255,255,0.2)', textAlign: 'right', userSelect: 'none', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.8rem', lineHeight: 1.6, borderRight: '1px solid rgba(255,255,255,0.08)', marginRight: '1rem' }}>
          {Array.from({ length: Math.max(1, text.split('\\n').length) }).map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.8rem', lineHeight: 1.6, color: '#a78bfa', whiteSpace: 'pre-wrap', flex: 1, overflow: 'hidden' }}>
          {text}
          <span style={{ borderRight: '2px solid #34d399', animation: 'blink 1s step-end infinite', opacity: isTyping ? 1 : 0 }}>&nbsp;</span>
        </pre>
      </div>
      <style>{`@keyframes blink { 50% { border-color: transparent } }`}</style>
    </div>
  );
};

/* ─── Main Login Component ─── */
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [focused, setFocused] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const result = await login(form.email.trim().toLowerCase(), form.password);
    if (result.success) navigate('/');
    else setServerErr(result.message);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { 
      setForm(f => ({ ...f, [key]: e.target.value })); 
      setErrors(er => ({ ...er, [key]: '' })); 
      setServerErr(''); 
    },
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(''),
  });

  const topErr = serverErr || (oauthError === 'access_denied' ? 'Authentication cancelled' : oauthError);

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="auth-split-page">
        <div className="auth-left-panel">
          <div className="auth-left-bg-grid" />
          <div className="auth-left-content">
            <div className="auth-logo-wrap">
              <div className="auth-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                </svg>
              </div>
              <span className="auth-logo-text">DevFlow <span>AI</span></span>
            </div>

            <div className="auth-left-tagline" style={{ marginTop: '2rem' }}>
              <h2>Supercharge your development.</h2>
              <p>Experience the ultimate AI-powered developer playground for system design, DevOps, and intelligent debugging.</p>
            </div>

            <DynamicMockup />

            {/* Premium Floating Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', zIndex: 2, position: 'relative' }}>
              {[
                { icon: '⚡', text: 'Sub-2s responses' },
                { icon: '🧠', text: 'LLaMA 3.3 70B Model' },
                { icon: '🔒', text: 'Private & Encrypted' },
                { icon: '🚀', text: 'GitHub Integration' },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 99,
                  fontSize: '0.75rem', color: 'var(--text-2)', backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '0.875rem' }}>{icon}</span>
                  <span style={{ fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-blob auth-blob-1" />
          <div className="auth-blob auth-blob-2" />
          <div className="auth-blob auth-blob-3" />
        </div>

        {/* Right form panel */}
        <div className="auth-right-panel">
          <div className="auth-particles">
            {[...Array(6)].map((_, i) => <div key={i} className={`auth-particle auth-particle-${i + 1}`} />)}
          </div>

          <div className="auth-form-container">
            {/* Mobile logo */}
            <div className="auth-mobile-logo">
              <div className="auth-logo-icon auth-logo-icon-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#eef2ff', letterSpacing: '-0.02em' }}>
                DevFlow <span style={{ background: 'linear-gradient(135deg,#c4b5fd,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
              </span>
            </div>

            <div className="auth-form-header">
              <h1 className="auth-form-title">
                Welcome <span style={{ background: 'linear-gradient(135deg, #c4b5fd, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>back</span>
              </h1>
              <p className="auth-form-subtitle">Sign in to your workspace to continue</p>
            </div>

            {topErr && (
              <div className="auth-error-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {topErr}
              </div>
            )}

            <div className="auth-oauth-row">
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`} className="auth-oauth-btn"><GoogleIcon /> Continue with Google</a>
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/github/auth`} className="auth-oauth-btn auth-oauth-btn-github"><GitHubIcon /> Continue with GitHub</a>
            </div>

            <div className="auth-divider"><span>or sign in with email</span></div>

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              {/* Email */}
              <div className={`auth-field ${focused==='email'?'auth-field--focused':''} ${errors.email?'auth-field--error':''}`}>
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input type="email" {...field('email')} placeholder="you@example.com" autoComplete="email" className="auth-input" />
                </div>
                {errors.email && (
                  <p className="auth-field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className={`auth-field ${focused==='password'?'auth-field--focused':''} ${errors.password?'auth-field--error':''}`}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <label className="auth-label">Password</label>
                  <button
                    type="button"
                    className="auth-forgot"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input type={showPw?'text':'password'} {...field('password')} placeholder="Enter your password" autoComplete="current-password" className="auth-input" style={{ paddingRight:'2.75rem' }} />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="auth-field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.password}
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? (
                  <><span className="auth-spinner" /> Signing in…</>
                ) : (
                  <>Sign in to DevFlow AI
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-footer-link">Create one free →</Link>
            </p>

            <div className="auth-trust-badges">
              <span>🔒 End-to-end encrypted</span>
              <span>⚡ Powered by Groq</span>
              <span>🆓 Free forever</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

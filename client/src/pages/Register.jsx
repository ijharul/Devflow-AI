import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [focused, setFocused] = useState('');
  const { register, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const score = useMemo(() => pwScore(form.password), [form.password]);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!EMAIL_RE.test(form.email))  e.email = 'Enter a valid email address';
    if (form.password.length < 8)   e.password = 'Password must be at least 8 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const result = await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
    if (result.success) {
      toast.success('Registered successfully! Please sign in.');
      navigate('/login');
    }
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

  return (
    <div className="auth-split-page auth-split-page--reverse">
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="auth-right-panel">
        <div className="auth-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`auth-particle auth-particle-${i + 1}`} />
          ))}
        </div>

        <div className="auth-form-container auth-form-container--register">
          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <div className="auth-logo-icon auth-logo-icon-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#eef2ff', letterSpacing: '-0.02em' }}>DevFlow <span style={{ background: 'linear-gradient(135deg, #c4b5fd, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span></span>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title">
              Create your <span style={{ background: 'linear-gradient(135deg, #c4b5fd, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>account</span>
            </h1>
            <p className="auth-form-subtitle">Start building smarter with AI — it's completely free</p>
          </div>

          {serverErr && (
            <div className="auth-error-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {serverErr}
            </div>
          )}

          {/* OAuth */}
          <div className="auth-oauth-row">
            <a href="/api/auth/google" className="auth-oauth-btn">
              <GoogleIcon /> Continue with Google
            </a>
            <a href="/api/github/auth" className="auth-oauth-btn auth-oauth-btn-github">
              <GitHubIcon /> Continue with GitHub
            </a>
          </div>

          <div className="auth-divider">
            <span>or register with email</span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {/* Name */}
            <div className={`auth-field ${focused === 'name' ? 'auth-field--focused' : ''} ${errors.name ? 'auth-field--error' : ''} ${form.name ? 'auth-field--filled' : ''}`}>
              <label className="auth-label">Full name</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  {...field('name')}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="auth-input"
                />
              </div>
              {errors.name && (
                <p className="auth-field-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className={`auth-field ${focused === 'email' ? 'auth-field--focused' : ''} ${errors.email ? 'auth-field--error' : ''} ${form.email ? 'auth-field--filled' : ''}`}>
              <label className="auth-label">Email address</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  {...field('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="auth-input"
                />
              </div>
              {errors.email && (
                <p className="auth-field-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className={`auth-field ${focused === 'password' ? 'auth-field--focused' : ''} ${errors.password ? 'auth-field--error' : ''} ${form.password ? 'auth-field--filled' : ''}`}>
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showPw ? 'text' : 'password'}
                  {...field('password')}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="auth-input"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password.length > 0 && (
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
              {errors.password && (
                <p className="auth-field-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.password}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Creating account…
                </>
              ) : (
                <>
                  Create free account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

            <p className="auth-terms">
              By creating an account, you agree to our{' '}
              <span style={{ color: '#c4b5fd', cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: '#c4b5fd', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

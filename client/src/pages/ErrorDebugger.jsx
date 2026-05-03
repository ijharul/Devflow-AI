import { useState } from 'react';
import apiClient from '../api/apiClient';
import { Bug, Send, AlertCircle, CheckCircle, Lightbulb, Code2, Shield, ChevronDown, ChevronUp, Copy, Check, RotateCcw } from 'lucide-react';

const EXAMPLE_ERRORS = [
  { label: 'TypeError', error: "TypeError: Cannot read properties of undefined (reading 'map')", code: "const result = data.items.map(item => item.name);", lang: 'JavaScript' },
  { label: 'CORS Error', error: "Access to XMLHttpRequest at 'http://localhost:5000/api' from origin 'http://localhost:3000' has been blocked by CORS policy", code: '', lang: 'JavaScript' },
  { label: 'Python KeyError', error: "KeyError: 'user_id'", code: "user_id = request.json['user_id']\nprint(user_id)", lang: 'Python' },
  { label: 'MongoError', error: "MongoServerError: E11000 duplicate key error collection: test.users index: email_1 dup key: { email: \"test@example.com\" }", code: '', lang: 'JavaScript' },
];

const SEVERITY_CONFIG = {
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  warning: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  info: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
};

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.625rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: '#64748b', fontSize: '0.7rem', cursor: 'pointer' }}>
      {copied ? <><Check size={10} color="#34d399" />Copied</> : <><Copy size={10} />Copy</>}
    </button>
  );
};

const Section = ({ icon: Icon, title, color, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1.125rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <Icon size={15} color={color} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', flex: 1 }}>{title}</span>
        {open ? <ChevronUp size={14} color="var(--text-3)" /> : <ChevronDown size={14} color="var(--text-3)" />}
      </button>
      {open && <div style={{ padding: '0 1.125rem 1rem', borderTop: '1px solid #1a1d30' }}>{children}</div>}
    </div>
  );
};

export default function ErrorDebugger() {
  const [errorMessage, setErrorMessage] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!errorMessage.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await apiClient.post('/debug/analyze', { errorMessage, code, language });
      setResult(data.data);
    } catch (err) { setError(err.message || 'Analysis failed'); }
    finally { setLoading(false); }
  };

  const loadExample = (ex) => {
    setErrorMessage(ex.error);
    setCode(ex.code);
    setLanguage(ex.lang);
    setResult(null);
  };

  const reset = () => { setErrorMessage(''); setCode(''); setLanguage(''); setResult(null); setError(''); };

  const LANGS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'C++'];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bug size={18} color="#f87171" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Smart Error Debugger</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Paste any error → AI finds root cause, explains it, and provides the fix</p>
        </div>
        {(result || errorMessage) && (
          <button onClick={reset} className="btn-secondary" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem' }}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Input section */}
      {!result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Quick examples */}
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>Quick Examples</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {EXAMPLE_ERRORS.map(ex => (
                <button key={ex.label} onClick={() => loadExample(ex)} className="chip">{ex.label}</button>
              ))}
            </div>
          </div>

          {/* Error message input */}
          <div className="section" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.125rem', borderBottom: '1px solid #1e2136' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Error Message <span style={{ color: '#f87171' }}>*</span></p>
            </div>
            <textarea value={errorMessage} onChange={e => setErrorMessage(e.target.value)}
              placeholder="Paste your error message here...&#10;&#10;e.g. TypeError: Cannot read properties of undefined (reading 'map')"
              rows={5} maxLength={3000}
              style={{ width: '100%', background: '#080a14', border: 'none', outline: 'none', padding: '1rem 1.125rem', color: '#f87171', fontSize: '0.825rem', fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace", resize: 'vertical', lineHeight: 1.6 }} />
            <div style={{ padding: '0.5rem 1.125rem', borderTop: '1px solid #1e2136', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontFamily: 'monospace' }}>{errorMessage.length}/3000</span>
            </div>
          </div>

          {/* Language selector */}
          <div>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Language <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {LANGS.map(lang => (
                <button key={lang} onClick={() => setLanguage(language === lang ? '' : lang)}
                  className={`chip${language === lang ? ' active' : ''}`}>{lang}</button>
              ))}
            </div>
          </div>

          {/* Code context */}
          <div className="code-card">
            <div className="code-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>Code Context <span style={{ fontWeight: 400 }}>(optional)</span></span>
              </div>
              {code && <CopyBtn text={code} />}
            </div>
            <textarea value={code} onChange={e => setCode(e.target.value)}
              placeholder="// Paste the code that's causing the error (optional but improves analysis)..."
              rows={8} maxLength={8000}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace", resize: 'vertical', lineHeight: 1.7 }} />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem' }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <button onClick={analyze} disabled={loading || !errorMessage.trim()} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: loading || !errorMessage.trim() ? undefined : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            {loading
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />Analyzing error...</>
              : <><Bug size={14} />Debug This Error</>}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Summary banner */}
          <div style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '1.125rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
              <div style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{result.errorType}</span>
              </div>
              {result.language && (
                <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, padding: '4px 10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa' }}>{result.language}</span>
                </div>
              )}
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.375rem' }}>{result.rootCause}</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>{result.explanation}</p>
          </div>

          {/* Quick Fix */}
          <Section icon={CheckCircle} title="Quick Fix" color="#34d399">
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.7, paddingTop: '0.875rem' }}>{result.quickFix}</p>
          </Section>

          {/* Fixed Code */}
          {result.fixedCode && (
            <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.125rem', borderBottom: '1px solid #1a1d30' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Code2 size={15} color="#34d399" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0' }}>Fixed Code</span>
                </div>
                <CopyBtn text={result.fixedCode} />
              </div>
              <pre style={{ margin: 0, padding: '1rem 1.125rem', fontSize: '0.8rem', color: '#94a3b8', fontFamily: "'JetBrains Mono','Fira Code',monospace", lineHeight: 1.7, overflowX: 'auto', background: '#080a14' }}>{result.fixedCode}</pre>
            </div>
          )}

          {/* Prevention Tips */}
          {result.preventionTips?.length > 0 && (
            <Section icon={Shield} title="Prevention Tips" color="#a78bfa" defaultOpen={true}>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.875rem' }}>
                {result.preventionTips.map((tip, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Related Errors */}
          {result.relatedErrors?.length > 0 && (
            <Section icon={Lightbulb} title="Related Errors to Watch Out For" color="#fbbf24" defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.875rem' }}>
                {result.relatedErrors.map((err, i) => (
                  <div key={i} style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 8, padding: '0.625rem 0.875rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>{err}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Debug another */}
          <button onClick={reset} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', alignSelf: 'flex-start' }}>
            <Bug size={13} /> Debug Another Error
          </button>
        </div>
      )}
    </div>
  );
}

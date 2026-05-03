import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import mermaid from 'mermaid';
import MessageBubble from '../components/Chat/MessageBubble';
import {
  Network, Container, MessageSquare, ArrowLeft, GitBranch, Copy, Check,
  Sparkles, AlertCircle, ChevronDown, ChevronUp, Send, RotateCcw,
  Star, ExternalLink, Zap, CheckCircle, Loader
} from 'lucide-react';

mermaid.initialize({
  startOnLoad: false, theme: 'dark',
  themeVariables: {
    primaryColor: '#7c3aed', primaryTextColor: '#e2e8f0', primaryBorderColor: '#5b21b6',
    lineColor: '#4b5563', background: '#0f1021', mainBkg: '#161829', nodeBorder: '#5b21b6',
    fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px',
  },
  securityLevel: 'loose',
  suppressErrorRendering: true,
});

/* ── helpers ── */
const CopyBtn = ({ text, label = 'Copy' }) => {
  const [c, setC] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setC(true); setTimeout(() => setC(false), 2000); };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, color: c ? '#34d399' : '#64748b', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
      {c ? <><Check size={10} />Copied</> : <><Copy size={10} />{label}</>}
    </button>
  );
};

const CodeBlock = ({ title, code, lang = '', defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  if (!code) return null;
  return (
    <div style={{ background: '#080a12', border: '1px solid #1a1e2e', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', borderBottom: '1px solid #141828', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>{title}</span>
          {lang && <span style={{ fontSize: '0.6rem', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', padding: '1px 6px', borderRadius: 99 }}>{lang}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <CopyBtn text={code} />
          <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, color: '#64748b', cursor: 'pointer' }}>
            {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>
      {open && <pre style={{ margin: 0, padding: '1rem', overflowX: 'auto', fontSize: '0.75rem', lineHeight: 1.65, color: '#94a3b8', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}><code>{code}</code></pre>}
    </div>
  );
};

const Pill = ({ label, color = '#a78bfa', bg = 'rgba(167,139,250,0.1)', border = 'rgba(167,139,250,0.2)' }) => (
  <span style={{ fontSize: '0.7rem', background: bg, border: `1px solid ${border}`, color, padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{label}</span>
);

const sLabel = (text) => (
  <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{text}</p>
);

const TABS = [
  { key: 'design',  label: 'System Design',   icon: Network,       color: '#a78bfa' },
  { key: 'devops',  label: 'DevOps',           icon: Container,     color: '#60a5fa' },
  { key: 'chat',    label: 'Deploy Assistant', icon: MessageSquare, color: '#34d399' },
];

const SUGGESTIONS = [
  'How do I deploy this to AWS?', 'Generate Kubernetes manifests',
  'Set up environment variables', 'Configure Nginx reverse proxy',
  'Deploy to Railway or Render', 'Set up monitoring and logging',
];

/* ── main component ── */
export default function GitHubRepoHub() {
  const { repoId } = useParams();
  const [repo, setRepo]         = useState(null);
  const [tab, setTab]           = useState('design');
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState('');

  /* per-tab generation state */
  const [sdLoading, setSdLoading]   = useState(false);
  const [doLoading, setDoLoading]   = useState(false);
  const [sdResult, setSdResult]     = useState(null);
  const [doResult, setDoResult]     = useState(null);
  const [sdError, setSdError]       = useState('');
  const [doError, setDoError]       = useState('');

  /* diagram */
  const mermaidRef                  = useRef(null);
  const [diagramErr, setDiagramErr] = useState(false);

  /* chat */
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError]   = useState('');
  const bottomRef                   = useRef(null);
  const inputRef                    = useRef(null);

  /* ── load repo ── */
  useEffect(() => {
    apiClient.get(`/github/repos/${repoId}`, { cache: false })
      .then(({ data }) => {
        const r = data.data;
        setRepo(r);
        if (r.systemDesign)   setSdResult(r.systemDesign);
        if (r.devopsPipeline) setDoResult(r.devopsPipeline);
        setMessages([{
          role: 'assistant',
          content: `Hi! I'm your AI Deploy Assistant for **${r.fullName}**. I have full context of this repo's structure, stack, and files.\n\nAsk me anything about deploying, scaling, or CI/CD for this project!`,
        }]);
      })
      .catch(() => setError('Failed to load repository'))
      .finally(() => setFetching(false));
  }, [repoId]);

  /* ── auto-generate if nothing exists ── */
  const autoGenerate = useCallback(async () => {
    if (sdResult && doResult) return;
    setSdLoading(true); setDoLoading(true);
    setSdError(''); setDoError('');
    try {
      const { data } = await apiClient.post(`/github/repos/${repoId}/auto-generate`, {}, { cache: false });
      if (data.data.systemDesign)   setSdResult(data.data.systemDesign);
      if (data.data.devopsPipeline) setDoResult(data.data.devopsPipeline);
      if (data.data.errors?.systemDesign)   setSdError(data.data.errors.systemDesign);
      if (data.data.errors?.devopsPipeline) setDoError(data.data.errors.devopsPipeline);
    } catch (err) {
      setSdError(err.message);
      setDoError(err.message);
    } finally {
      setSdLoading(false); setDoLoading(false);
    }
  }, [repoId, sdResult, doResult]);

  useEffect(() => {
    if (repo && !sdResult && !doResult && !sdLoading) autoGenerate();
  }, [repo]);

  /* ── re-generate individual ── */
  const regenSD = async () => {
    setSdLoading(true); setSdError(''); setSdResult(null);
    try {
      const { data } = await apiClient.post(`/github/repos/${repoId}/system-design`, {}, { cache: false });
      setSdResult(data.data);
    } catch (err) { setSdError(err.message); }
    finally { setSdLoading(false); }
  };

  const regenDO = async () => {
    setDoLoading(true); setDoError(''); setDoResult(null);
    try {
      const { data } = await apiClient.post(`/github/repos/${repoId}/devops`, {}, { cache: false });
      setDoResult(data.data);
    } catch (err) { setDoError(err.message); }
    finally { setDoLoading(false); }
  };

  /* ── mermaid ── */
  useEffect(() => {
    if (!sdResult?.mermaidDiagram || !mermaidRef.current) return;
    (async () => {
      try {
        mermaidRef.current.innerHTML = '';
        setDiagramErr(false);
        const clean = sdResult.mermaidDiagram
          .replace(/^```(?:mermaid)?\s*/i, '')
          .replace(/\s*```\s*$/, '')
          .replace(/\|>/g, '|') // Fix invalid arrows like `-->|Text|>` 
          .replace(/;\s*(?=[A-Za-z])/g, '\n') // Replace semicolons with newlines for better rendering
          .replace(/->>/g, '-->') // Fix sequence diagram arrows
          .trim();
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, clean);
        if (mermaidRef.current) mermaidRef.current.innerHTML = svg;
      } catch { setDiagramErr(true); }
    })();
  }, [sdResult?.mermaidDiagram, tab]);

  /* ── chat ── */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || chatLoading) return;
    setInput(''); setChatError('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const { data } = await apiClient.post(`/github/repos/${repoId}/deploy-chat`, {
        message: msg,
        history: messages.map(({ role, content }) => ({ role, content })),
      });
      setMessages(p => [...p, { role: 'assistant', content: data.data.reply }]);
    } catch (err) { setChatError(err.message); }
    finally { setChatLoading(false); inputRef.current?.focus(); }
  };

  /* ── loading / error states ── */
  if (fetching) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '0.75rem', color: 'var(--text-3)' }}>
      <span className="spinner" /> Loading repository…
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center' }}>
      <div className="alert alert-error" style={{ justifyContent: 'center' }}><AlertCircle size={14} />{error}</div>
      <Link to="/github" className="btn-secondary" style={{ display: 'inline-flex', marginTop: '1rem', gap: '0.375rem' }}><ArrowLeft size={13} />Back to repos</Link>
    </div>
  );

  /* ── status badge helpers ── */
  const sdDone = !!sdResult;
  const doDone = !!doResult;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <Link to="/github" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-3)', fontSize: '0.875rem', textDecoration: 'none', padding: '0.4rem 0.875rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-overlay)', flexShrink: 0, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-hi)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
          <ArrowLeft size={12} /> Back
        </Link>

        <div style={{ width: 36, height: 36, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GitBranch size={16} color="#a78bfa" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo?.fullName}</h1>
          {repo?.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.description}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {repo?.language && <Pill label={repo.language} />}
          {repo?.stars > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: 'var(--text-3)' }}>
              <Star size={12} color="#fbbf24" fill="#fbbf24" />{repo.stars}
            </span>
          )}
          <a href={repo?.repoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-3)', fontSize: '0.7rem', textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
            <ExternalLink size={11} /> View on GitHub
          </a>
        </div>
      </div>

      {/* ── Generation status bar ── */}
      {(sdLoading || doLoading) && (
        <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '0.75rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="spinner spinner-sm" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#a78bfa' }}>Auto-generating your repo analysis…</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {sdLoading ? <span className="spinner spinner-sm" style={{ width: 10, height: 10 }} /> : <CheckCircle size={10} color="#34d399" />}
                System Design
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {doLoading ? <span className="spinner spinner-sm" style={{ width: 10, height: 10 }} /> : <CheckCircle size={10} color="#34d399" />}
                DevOps Pipeline
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {sdDone && <span style={{ fontSize: '0.65rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '2px 8px', borderRadius: 99 }}>Design ✓</span>}
            {doDone && <span style={{ fontSize: '0.65rem', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: 99 }}>DevOps ✓</span>}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(({ key, label, icon: Icon, color }) => {
          const done = key === 'design' ? sdDone : key === 'devops' ? doDone : true;
          const loading = key === 'design' ? sdLoading : key === 'devops' ? doLoading : false;
          return (
            <button key={key} onClick={() => setTab(key)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: `2px solid ${tab === key ? color : 'transparent'}`, cursor: 'pointer', color: tab === key ? color : 'var(--text-3)', fontSize: '0.8125rem', fontWeight: tab === key ? 600 : 500, fontFamily: 'inherit', transition: 'all 0.15s', marginBottom: -1 }}>
              {loading ? <span className="spinner spinner-sm" style={{ width: 12, height: 12 }} /> : <Icon size={13} />}
              {label}
              {done && !loading && key !== 'chat' && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── SYSTEM DESIGN TAB ── */}
      {tab === 'design' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sdError && <div className="alert alert-error"><AlertCircle size={13} />{sdError}<button onClick={regenSD} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Retry</button></div>}

          {sdLoading && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
              <span className="spinner spinner-lg" style={{ display: 'block', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Analyzing repository architecture…</p>
            </div>
          )}

          {!sdLoading && !sdResult && !sdError && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Network size={22} color="#a78bfa" />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>Generate System Design</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>AI will analyze the repository and produce a full architecture diagram</p>
              <button onClick={regenSD} className="btn-primary" style={{ display: 'inline-flex', gap: '0.5rem' }}>
                <Sparkles size={14} /> Generate Architecture
              </button>
            </div>
          )}

          {sdResult && (
            <>
              {/* Detected Stack */}
              {sdResult.detectedStack?.length > 0 && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.125rem 1.25rem' }}>
                  {sLabel('Detected Stack')}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {sdResult.detectedStack.map(s => <Pill key={s} label={s} />)}
                  </div>
                </div>
              )}

              {/* Overview */}
              {sdResult.overview && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                  {sLabel('Overview')}
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{sdResult.overview}</p>
                </div>
              )}

              {/* Components */}
              {sdResult.components?.length > 0 && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                  {sLabel('Architecture Components')}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.625rem' }}>
                    {sdResult.components.map((c, i) => (
                      <div key={i} style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.875rem' }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.25rem' }}>{c.name}</p>
                        <p style={{ fontSize: '0.6rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.5rem' }}>{c.type}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{c.description}</p>
                        {c.technology && <code style={{ display: 'inline-block', marginTop: '0.375rem', fontSize: '0.675rem', color: '#fbbf24', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 5, fontFamily: 'monospace' }}>{c.technology}</code>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack + Improvements */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {sdResult.techStack && Object.keys(sdResult.techStack).length > 0 && (
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                    {sLabel('Tech Stack')}
                    {Object.entries(sdResult.techStack).map(([layer, techs]) => (
                      <div key={layer} style={{ marginBottom: '0.75rem' }}>
                        <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>{layer}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {(techs || []).map(t => <span key={t} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-2)', padding: '2px 8px', borderRadius: 8, fontWeight: 500 }}>{t}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sdResult.improvements?.length > 0 && (
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                    {sLabel('Improvement Suggestions')}
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', margin: 0, padding: 0, listStyle: 'none' }}>
                      {sdResult.improvements.map((imp, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa' }} />
                          </div>
                          <span style={{ fontSize: '0.775rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Detailed Explanation */}
              {sdResult.detailedExplanation && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
                  {sLabel('Architecture Deep Dive')}
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {sdResult.detailedExplanation}
                  </div>
                </div>
              )}

              {/* Mermaid Diagram */}
              {sdResult.mermaidDiagram && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    {sLabel('Architecture Diagram')}
                    <CopyBtn text={sdResult.mermaidDiagram} label="Copy Mermaid" />
                  </div>
                  {diagramErr ? (
                    <div className="alert alert-error" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <p>Diagram render failed. Raw source:</p>
                      <pre style={{ fontSize: '0.7rem', color: '#94a3b8', overflowX: 'auto', fontFamily: 'monospace', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{sdResult.mermaidDiagram}</pre>
                    </div>
                  ) : (
                    <div ref={mermaidRef} style={{ background: '#0d0f1c', borderRadius: 12, padding: '1rem', overflowX: 'auto', display: 'flex', justifyContent: 'center' }} />
                  )}
                </div>
              )}

              <button onClick={regenSD} disabled={sdLoading} className="btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
                <Sparkles size={13} /> Regenerate
              </button>
            </>
          )}
        </div>
      )}

      {/* ── DEVOPS TAB ── */}
      {tab === 'devops' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {doError && <div className="alert alert-error"><AlertCircle size={13} />{doError}<button onClick={regenDO} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Retry</button></div>}

          {doLoading && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
              <span className="spinner spinner-lg" style={{ display: 'block', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Generating Dockerfile, CI/CD pipeline, and deployment config…</p>
            </div>
          )}

          {!doLoading && !doResult && !doError && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Container size={22} color="#60a5fa" />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>Generate DevOps Pipeline</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>AI generates Dockerfile, docker-compose, CI/CD pipeline and deployment guide</p>
              <button onClick={regenDO} className="btn-primary" style={{ display: 'inline-flex', gap: '0.5rem' }}>
                <Container size={14} /> Generate Pipeline
              </button>
            </div>
          )}

          {doResult && (
            <>
              {/* Deployment Steps */}
              {doResult.deploymentSteps?.length > 0 && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                  {sLabel('Deployment Steps')}
                  <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', margin: 0, padding: 0, listStyle: 'none' }}>
                    {doResult.deploymentSteps.map((step, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', fontWeight: 700, color: '#60a5fa', marginTop: 1 }}>{i + 1}</div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <CodeBlock title="Dockerfile" code={doResult.dockerfile} lang="dockerfile" defaultOpen={true} />
              <CodeBlock title="docker-compose.yml" code={doResult.dockerCompose} lang="yaml" defaultOpen={true} />
              <CodeBlock title=".github/workflows/ci-cd.yml" code={doResult.githubActionsYaml} lang="yaml" defaultOpen={true} />

              {/* Env Vars */}
              {doResult.environmentVariables?.length > 0 && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                  {sLabel('Required Environment Variables')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {doResult.environmentVariables.map((env, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.625rem 0.875rem' }}>
                        <code style={{ fontSize: '0.775rem', color: '#a78bfa', fontFamily: 'monospace', fontWeight: 600, flexShrink: 0 }}>{env.key || env.name}</code>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', flex: 1 }}>{env.description}</span>
                        {env.required && <span style={{ fontSize: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '1px 6px', borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>required</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deployment Options */}
              {doResult.deploymentOptions?.length > 0 && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                  {sLabel('Deployment Options')}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem' }}>
                    {doResult.deploymentOptions.map((opt, i) => (
                      <div key={i} style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.875rem' }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.375rem' }}>{opt.platform}</p>
                        {opt.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{opt.description}</p>}
                        {opt.steps?.length > 0 && (
                          <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                            {opt.steps.map((s, j) => <li key={j} style={{ fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.6 }}>{s}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Deployment Guide */}
              {doResult.deploymentGuide && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                  {sLabel('How to Deploy')}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {doResult.deploymentGuide}
                  </div>
                </div>
              )}

              <button onClick={regenDO} disabled={doLoading} className="btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
                <Sparkles size={13} /> Regenerate
              </button>
            </>
          )}
        </div>
      )}

      {/* ── DEPLOY CHAT TAB ── */}
      {tab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 16rem)' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '0.75rem' }}>
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            {chatLoading && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#34d399', flexShrink: 0 }}>AI</div>
                <div style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '0.75rem 1rem', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                  {[0,1,2].map(j => <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', opacity: 0.6, display: 'block', animation: 'bounce 1s infinite', animationDelay: `${j*0.15}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
            <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {SUGGESTIONS.map(s => <button key={s} onClick={() => sendMessage(s)} className="chip">{s}</button>)}
            </div>
          )}

          {chatError && <div className="alert alert-error" style={{ marginBottom: '0.5rem' }}><AlertCircle size={13} />{chatError}</div>}

          {/* Input */}
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about deployment, Docker, CI/CD… (Enter to send)" rows={2}
              className="input" style={{ flex: 1, resize: 'none', lineHeight: 1.5 }} />
            <button onClick={() => sendMessage()} disabled={chatLoading || !input.trim()} className="btn-primary"
              style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end', padding: 0 }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

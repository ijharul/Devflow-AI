import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import mermaid from 'mermaid';
import { Network, ArrowLeft, GitBranch, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#7c3aed',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#5b21b6',
    lineColor: '#4b5563',
    background: '#0f1021',
    mainBkg: '#161829',
    nodeBorder: '#5b21b6',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
  },
});

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer' }}>
      {copied ? <><Check size={11} color="#34d399" /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
};

export default function GitHubRepoSystemDesign() {
  const { repoId } = useParams();
  const [repo, setRepo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [diagramError, setDiagramError] = useState(false);
  const mermaidRef = useRef(null);

  useEffect(() => {
    apiClient.get(`/github/repos/${repoId}`)
      .then(({ data }) => {
        setRepo(data.data);
        if (data.data.systemDesign) setResult(data.data.systemDesign);
      })
      .catch(() => setError('Failed to load repository'))
      .finally(() => setFetching(false));
  }, [repoId]);

  useEffect(() => {
    if (!result?.mermaidDiagram || !mermaidRef.current) return;
    const render = async () => {
      try {
        mermaidRef.current.innerHTML = '';
        setDiagramError(false);
        const { svg } = await mermaid.render(`mermaid-sd-${Date.now()}`, result.mermaidDiagram);
        if (mermaidRef.current) mermaidRef.current.innerHTML = svg;
      } catch { setDiagramError(true); }
    };
    render();
  }, [result?.mermaidDiagram]);

  const generate = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await apiClient.post(`/github/repos/${repoId}/system-design`);
      setResult(data.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading repository...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/github" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-3)', fontSize: '0.75rem', textDecoration: 'none', padding: '0.375rem 0.75rem', border: '1px solid #1e2136', borderRadius: 8, background: '#0a0b14' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'var(--text-4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = '#1e2136'; }}>
          <ArrowLeft size={12} /> Back
        </Link>
        <div style={{ width: 36, height: 36, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Network size={16} color="#a78bfa" />
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>System Design</h1>
          {repo && <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{repo.fullName}</p>}
        </div>
      </div>

      {/* Repo info */}
      {repo && (
        <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GitBranch size={16} color="#4a5070" />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0' }}>{repo.fullName}</span>
            {repo.description && <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: '0.75rem' }}>{repo.description}</span>}
          </div>
          {repo.language && <span style={{ fontSize: '0.65rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>{repo.language}</span>}
        </div>
      )}

      {/* Generate button */}
      {!result && !loading && (
        <div className="section" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Sparkles size={22} color="#a78bfa" />
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>Generate System Design</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>AI will analyze the repository and produce a full architecture diagram</p>
          <button onClick={generate} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}>
            <Network size={14} /> Generate Architecture
          </button>
        </div>
      )}

      {loading && (
        <div className="section" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(167,139,250,0.2)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Analyzing repository and generating architecture...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Overview */}
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Detected Stack</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(result.detectedStack || []).map(s => (
                <span key={s} style={{ fontSize: '0.75rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Components */}
          {result.components?.length > 0 && (
            <div className="section">
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Architecture Components</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.625rem' }}>
                {result.components.map((c, i) => (
                  <div key={i} style={{ background: '#0a0b14', border: '1px solid #1e2136', borderRadius: 10, padding: '0.875rem' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>{c.name}</p>
                    <p style={{ fontSize: '0.65rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.5rem' }}>{c.type}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{c.description}</p>
                    {c.technology && <p style={{ fontSize: '0.7rem', color: '#4a5070', marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 6, display: 'inline-block', fontFamily: 'monospace' }}>{c.technology}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack + Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {result.techStack && Object.keys(result.techStack).length > 0 && (
              <div className="section">
                <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Tech Stack</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(result.techStack).map(([layer, techs]) => (
                    <div key={layer}>
                      <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>{layer}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {(techs || []).map(t => <span key={t} style={{ fontSize: '0.7rem', background: '#151728', border: '1px solid #1e2136', color: '#94a3b8', padding: '2px 8px', borderRadius: 8, fontWeight: 500 }}>{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.improvements?.length > 0 && (
              <div className="section">
                <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Improvements</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {result.improvements.map((imp, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa' }} />
                      </div>
                      <span style={{ fontSize: '0.775rem', color: '#64748b', lineHeight: 1.5 }}>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mermaid diagram */}
          {result.mermaidDiagram && (
            <div className="section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Architecture Diagram</p>
                <CopyBtn text={result.mermaidDiagram} />
              </div>
              {diagramError ? (
                <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: '0.75rem' }}>Diagram rendering failed. Raw Mermaid source:</p>
                  <pre style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{result.mermaidDiagram}</pre>
                </div>
              ) : (
                <div ref={mermaidRef} style={{ background: '#0a0b14', borderRadius: 12, padding: '1rem', overflow: 'auto', display: 'flex', justifyContent: 'center' }} />
              )}
            </div>
          )}

          {/* Regenerate */}
          <button onClick={generate} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', alignSelf: 'flex-start' }}>
            <Sparkles size={13} /> Regenerate
          </button>
        </div>
      )}
    </div>
  );
}

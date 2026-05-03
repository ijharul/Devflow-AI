import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import mermaid from 'mermaid';
import {
  GitCompare, Send, RotateCcw, TrendingUp, TrendingDown, Minus,
  CheckCircle, AlertCircle, Trophy, ArrowRight, Copy, Check
} from 'lucide-react';

mermaid.initialize({
  startOnLoad: false, theme: 'dark',
  themeVariables: { primaryColor: '#7c3aed', primaryTextColor: '#e2e8f0', primaryBorderColor: '#5b21b6', lineColor: '#4b5563', background: '#0f1021', mainBkg: '#161829', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '13px' },
});

const PRESETS = [
  { label: 'Monolith vs Microservices', a: 'Monolithic architecture — single Node.js app, single PostgreSQL database, deployed as one unit', b: 'Microservices — separate services for auth, users, orders, notifications; each with own database; communicate via REST/message queue' },
  { label: 'REST vs GraphQL', a: 'REST API — multiple endpoints, versioned routes, JSON responses, standard HTTP caching', b: 'GraphQL API — single endpoint, schema-defined queries, client-driven data fetching, subscriptions support' },
  { label: 'SQL vs NoSQL', a: 'PostgreSQL relational database — ACID transactions, normalized schema, complex JOINs, strong consistency', b: 'MongoDB NoSQL database — document model, flexible schema, horizontal sharding, eventual consistency' },
  { label: 'Serverless vs Containers', a: 'AWS Lambda serverless — event-driven, auto-scaling, pay-per-invocation, managed infrastructure', b: 'Docker containers on ECS — always-on, predictable latency, full control, fixed compute cost' },
  { label: 'SSR vs CSR', a: 'Server-Side Rendering with Next.js — HTML generated on server, SEO-friendly, faster first paint', b: 'Client-Side React SPA — all rendering in browser, rich interactivity, faster subsequent navigation' },
  { label: 'Message Queue vs Direct API', a: 'Synchronous REST API calls between services — simple, direct, immediate response, tight coupling', b: 'Async message queue (RabbitMQ/Kafka) — decoupled services, retry logic, eventual consistency, higher complexity' },
];

const WINNER_COLORS = { A: '#a78bfa', B: '#60a5fa', Tie: '#94a3b8', 'Context-Dependent': '#fbbf24' };

const ScoreBar = ({ score, color, flipped }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: flipped ? 'row-reverse' : 'row' }}>
    <div style={{ flex: 1, height: 6, background: '#1e2136', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${score * 10}%`, borderRadius: 99, background: color, transition: 'width 0.6s ease' }} />
    </div>
    <span style={{ fontSize: '0.75rem', fontWeight: 700, color, minWidth: '1.25rem', textAlign: flipped ? 'left' : 'right' }}>{score}</span>
  </div>
);

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.625rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: '#64748b', fontSize: '0.7rem', cursor: 'pointer' }}>
      {copied ? <><Check size={10} color="#34d399" />Copied</> : <><Copy size={10} />Copy</>}
    </button>
  );
};

export default function ArchitectureComparison() {
  const [archA, setArchA] = useState('');
  const [archB, setArchB] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagramError, setDiagramError] = useState(false);
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (!result?.mermaidDiagram || !mermaidRef.current) return;
    const render = async () => {
      try {
        mermaidRef.current.innerHTML = '';
        setDiagramError(false);
        const { svg } = await mermaid.render(`mermaid-cmp-${Date.now()}`, result.mermaidDiagram);
        if (mermaidRef.current) mermaidRef.current.innerHTML = svg;
      } catch { setDiagramError(true); }
    };
    render();
  }, [result?.mermaidDiagram]);

  const compare = async () => {
    if (!archA.trim() || !archB.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await apiClient.post('/compare/compare', { archA, archB, context });
      setResult(data.data);
    } catch (err) { setError(err.message || 'Comparison failed'); }
    finally { setLoading(false); }
  };

  const loadPreset = (p) => { setArchA(p.a); setArchB(p.b); setResult(null); setError(''); };

  const reset = () => { setArchA(''); setArchB(''); setContext(''); setResult(null); setError(''); };

  const overallWinner = result?.overallWinner;
  const winnerColor = WINNER_COLORS[overallWinner] || '#94a3b8';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GitCompare size={18} color="#60a5fa" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Architecture Comparison</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Compare two architectures across 8 dimensions — get scores, insights, and a verdict</p>
        </div>
        {result && (
          <button onClick={reset} className="btn-secondary" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem' }}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Input section */}
      {!result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Presets */}
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>Quick Comparisons</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => loadPreset(p)} className="chip">{p.label}</button>
              ))}
            </div>
          </div>

          {/* Two-column inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#a78bfa' }}>A</div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa' }}>Architecture A</p>
              </div>
              <textarea value={archA} onChange={e => setArchA(e.target.value)}
                placeholder="e.g. Monolithic Node.js app with PostgreSQL, deployed on a single VPS, handles all features in one codebase"
                rows={5}
                style={{ width: '100%', background: '#0f1120', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '0.875rem 1rem', color: '#e2e8f0', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.2)'} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#151728', border: '1px solid #2a2d46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={16} color="var(--text-3)" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#60a5fa' }}>B</div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa' }}>Architecture B</p>
              </div>
              <textarea value={archB} onChange={e => setArchB(e.target.value)}
                placeholder="e.g. Microservices with Docker, separate services for auth/users/orders, Kafka for messaging, Kubernetes orchestration"
                rows={5}
                style={{ width: '100%', background: '#0f1120', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 12, padding: '0.875rem 1rem', color: '#e2e8f0', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(96,165,250,0.2)'} />
            </div>
          </div>

          {/* Context */}
          <div>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              Project Context <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional — team size, scale, budget, timeline)</span>
            </p>
            <input value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. 3-person team, 10k users, early-stage startup, 3-month timeline, tight budget"
              className="input" style={{ padding: '0.6875rem 1rem' }} />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem' }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <button onClick={compare} disabled={loading || !archA.trim() || !archB.trim()} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem' }}>
            {loading
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />Analyzing architectures...</>
              : <><GitCompare size={15} />Compare Architectures</>}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
        </div>
      )}

      {/* ─── RESULTS ─── */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Verdict banner */}
          <div style={{ background: `linear-gradient(135deg, rgba(167,139,250,0.06), rgba(96,165,250,0.06))`, border: `1px solid rgba(124,58,237,0.25)`, borderRadius: 16, padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
              {/* Arch A summary */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa' }}>A</div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a78bfa' }}>{result.architectureA?.name}</span>
                  {overallWinner === 'A' && <Trophy size={14} color="#fbbf24" />}
                </div>
                <p style={{ fontSize: '0.775rem', color: '#64748b', lineHeight: 1.5 }}>{result.architectureA?.summary}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.375rem' }}>Best for: <span style={{ color: '#94a3b8' }}>{result.architectureA?.bestFor}</span></p>
              </div>

              {/* VS divider */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-4)', letterSpacing: '0.1em' }}>VS</div>
              </div>

              {/* Arch B summary */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#60a5fa' }}>B</div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#60a5fa' }}>{result.architectureB?.name}</span>
                  {overallWinner === 'B' && <Trophy size={14} color="#fbbf24" />}
                </div>
                <p style={{ fontSize: '0.775rem', color: '#64748b', lineHeight: 1.5 }}>{result.architectureB?.summary}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.375rem' }}>Best for: <span style={{ color: '#94a3b8' }}>{result.architectureB?.bestFor}</span></p>
              </div>
            </div>

            {/* Overall winner */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <Trophy size={15} color={winnerColor} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: winnerColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {overallWinner === 'A' ? result.architectureA?.name : overallWinner === 'B' ? result.architectureB?.name : overallWinner}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6 }}>{result.verdict}</p>
            </div>
          </div>

          {/* Dimension comparison table */}
          {result.dimensions?.length > 0 && (
            <div className="section">
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Dimension-by-Dimension Comparison</p>

              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto 160px', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase' }}></span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', textAlign: 'right' }}>A</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', textAlign: 'center', width: 40 }}></span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>B</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {result.dimensions.map((dim, i) => (
                  <div key={i} style={{ background: '#0a0b14', border: '1px solid #1e2136', borderRadius: 10, padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto 160px', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{dim.category}</span>
                      <ScoreBar score={dim.scoreA} color="#a78bfa" flipped={true} />
                      <div style={{ width: 36, textAlign: 'center' }}>
                        {dim.winner === 'A' && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', padding: '2px 5px', borderRadius: 99 }}>A wins</span>}
                        {dim.winner === 'B' && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', padding: '2px 5px', borderRadius: 99 }}>B wins</span>}
                        {dim.winner === 'Tie' && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', background: 'rgba(100,116,139,0.12)', border: '1px solid rgba(100,116,139,0.2)', padding: '2px 5px', borderRadius: 99 }}>Tie</span>}
                      </div>
                      <ScoreBar score={dim.scoreB} color="#60a5fa" />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{dim.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score totals */}
          {result.dimensions?.length > 0 && (() => {
            const totalA = result.dimensions.reduce((s, d) => s + (d.scoreA || 0), 0);
            const totalB = result.dimensions.reduce((s, d) => s + (d.scoreB || 0), 0);
            const max = result.dimensions.length * 10;
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Architecture A', name: result.architectureA?.name, total: totalA, color: '#a78bfa', badge: 'A' },
                  { label: 'Architecture B', name: result.architectureB?.name, total: totalB, color: '#60a5fa', badge: 'B' },
                ].map(({ label, name, total, color, badge }) => (
                  <div key={badge} style={{ background: '#0f1120', border: `1px solid ${color}25`, borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color }}>{badge}</div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{name}</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{total}<span style={{ fontSize: '1rem', color: 'var(--text-3)', fontWeight: 500 }}>/{max}</span></div>
                    <div style={{ marginTop: '0.5rem', height: 6, background: '#1e2136', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(total / max) * 100}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Use Cases */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {[
              { list: result.useCasesA, label: 'Ideal Use Cases for A', name: result.architectureA?.name, color: '#a78bfa' },
              { list: result.useCasesB, label: 'Ideal Use Cases for B', name: result.architectureB?.name, color: '#60a5fa' },
            ].map(({ list, label, name, color }) => list?.length > 0 && (
              <div key={label} style={{ background: '#0f1120', border: `1px solid ${color}20`, borderRadius: 12, padding: '1rem' }}>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{label}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {list.map((u, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <CheckCircle size={12} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Migration path */}
          {result.migrationPath && (
            <div className="section">
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Migration Path (A → B)</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.7 }}>{result.migrationPath}</p>
            </div>
          )}

          {/* Mermaid diagram */}
          {result.mermaidDiagram && (
            <div className="section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Architecture Diagram</p>
                <CopyBtn text={result.mermaidDiagram} />
              </div>
              {diagramError ? (
                <pre style={{ fontSize: '0.7rem', color: '#64748b', background: '#080a14', border: '1px solid #1e2136', borderRadius: 10, padding: '1rem', overflow: 'auto', fontFamily: 'monospace' }}>{result.mermaidDiagram}</pre>
              ) : (
                <div ref={mermaidRef} style={{ background: '#080a14', borderRadius: 12, padding: '1rem', overflow: 'auto', display: 'flex', justifyContent: 'center', minHeight: 100 }} />
              )}
            </div>
          )}

          {/* Compare another */}
          <button onClick={reset} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', alignSelf: 'flex-start' }}>
            <GitCompare size={13} /> Compare Another
          </button>
        </div>
      )}
    </div>
  );
}
